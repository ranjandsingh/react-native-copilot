import mitt, { type Emitter } from "mitt";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { findNodeHandle, type ScrollView } from "react-native";
import {
  CopilotModal,
  type CopilotModalHandle,
} from "../components/CopilotModal";
import { OFFSET_WIDTH } from "../components/style";
import { useStateWithAwait } from "../hooks/useStateWithAwait";
import { useStepsMap } from "../hooks/useStepsMap";
import { type CopilotOptions, type Step } from "../types";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  start: undefined;
  stop: undefined;
  stepChange: Step | undefined;
};

interface CopilotContextType {
  registerStep: (step: Step) => void;
  unregisterStep: (stepName: string) => void;
  currentStep: Step | undefined;
  start: (
    fromStep?: string | number,
    suppliedScrollView?: ScrollView | null,
    suppliedBeforeStepChange?: (step: Step | undefined) => void | Promise<void>,
    toStep?: string | number,
  ) => Promise<void>;
  stop: () => Promise<void>;
  goToNext: () => Promise<void>;
  goToNth: (n: number) => Promise<void>;
  goToPrev: () => Promise<void>;
  visible: boolean;
  copilotEvents: Emitter<Events>;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStepNumber: number;
  totalStepsNumber: number;
  showSkipButton: boolean;
  showPreviousButton: boolean;
}

/*
This is the maximum wait time for the steps to be registered before starting the tutorial
At 60fps means 2 seconds
*/
const MAX_START_TRIES = 120;

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider = ({
  verticalOffset = 0,
  beforeStepChange,
  showSkipButton = true,
  showPreviousButton = true,
  children,
  ...rest
}: PropsWithChildren<CopilotOptions>) => {
  const startTries = useRef(0);
  const copilotEvents = useRef(mitt<Events>()).current;
  const modal = useRef<CopilotModalHandle | null>(null);

  const [visible, setVisibility] = useStateWithAwait(false);
  const [scrollView, setScrollView] = useState<ScrollView | null>(null);
  const [stopAtStep, setStopAtStep] = useState<string | undefined>(undefined);
  const [beforeStepChangeCallback, setBeforeStepChangeCallback] = useState<
    ((step: Step | undefined) => void | Promise<void>) | undefined
  >(beforeStepChange);

  const {
    currentStep,
    currentStepNumber,
    totalStepsNumber,
    getFirstStep,
    getPrevStep,
    getNextStep,
    getNthStep,
    isFirstStep,
    isLastStep,
    setCurrentStepState,
    steps,
    registerStep,
    unregisterStep,
  } = useStepsMap();

  const moveModalToStep = useCallback(
    async (step: Step) => {
      const size = await step?.measure();

      if (!size) {
        return;
      }

      await modal.current?.animateMove({
        width: size.width + OFFSET_WIDTH,
        height: size.height + OFFSET_WIDTH,
        x: size.x - OFFSET_WIDTH / 2,
        y: size.y - OFFSET_WIDTH / 2 + verticalOffset,
      });
    },
    [verticalOffset],
  );

  const setCurrentStep = useCallback(
    async (step?: Step, move: boolean = true) => {
      setCurrentStepState(step);
      copilotEvents.emit("stepChange", step);

      if (scrollView != null) {
        const nodeHandle = findNodeHandle(scrollView);
        if (nodeHandle) {
          step?.wrapperRef.current?.measureLayout(
            nodeHandle,
            (_x, y, _w, h) => {
              const yOffset = y > 0 ? y - h / 2 : 0;
              scrollView.scrollTo({ y: yOffset, animated: false });
            },
          );
        }
      }

      setTimeout(
        () => {
          if (move && step) {
            void moveModalToStep(step);
          }
        },
        scrollView != null ? 100 : 0,
      );
    },
    [copilotEvents, moveModalToStep, scrollView, setCurrentStepState],
  );

  const start = useCallback(
    async (
      fromStep?: string | number,
      suppliedScrollView: ScrollView | null = null,
      suppliedBeforeStepChange?: (
        step: Step | undefined,
      ) => void | Promise<void>,
      toStep?: string | number,
    ) => {
      if (scrollView == null) {
        setScrollView(suppliedScrollView);
      }

      if (suppliedBeforeStepChange) {
        setBeforeStepChangeCallback(() => suppliedBeforeStepChange);
      }

      // Resolve fromStep - can be step name (string) or step order (number)
      let startStep: Step | undefined;
      if (fromStep == null) {
        startStep = getFirstStep();
      } else if (typeof fromStep === "number") {
        startStep = getNthStep(fromStep);
      } else {
        startStep = steps[fromStep];
      }

      // Resolve toStep - can be step name (string) or step order (number)
      let stopStepName: string | undefined;
      if (toStep != null) {
        if (typeof toStep === "number") {
          const resolvedStopStep = getNthStep(toStep);
          stopStepName = resolvedStopStep?.name;
        } else {
          stopStepName = toStep;
        }
      }
      setStopAtStep(stopStepName);

      if (startTries.current > MAX_START_TRIES) {
        startTries.current = 0;
        return;
      }

      if (startStep == null) {
        startTries.current += 1;
        requestAnimationFrame(() => {
          void start(fromStep, suppliedScrollView, suppliedBeforeStepChange, toStep);
        });
      } else {
        copilotEvents.emit("start");
        if (beforeStepChangeCallback) {
          await beforeStepChangeCallback(startStep);
        }
        await setCurrentStep(startStep);
        await moveModalToStep(startStep);
        await setVisibility(true);
        startTries.current = 0;
      }
    },
    [
      copilotEvents,
      getFirstStep,
      getNthStep,
      moveModalToStep,
      scrollView,
      setCurrentStep,
      setVisibility,
      steps,
      beforeStepChangeCallback,
    ],
  );

  const stop = useCallback(async () => {
    await setVisibility(false);
    setStopAtStep(undefined);
    copilotEvents.emit("stop");
  }, [copilotEvents, setVisibility]);

  const next = useCallback(async () => {
    const nextStep = getNextStep();
    if (beforeStepChangeCallback) {
      await beforeStepChangeCallback(nextStep);
    }
    await setCurrentStep(nextStep);
  }, [getNextStep, setCurrentStep, beforeStepChangeCallback]);

  const nth = useCallback(
    async (n: number) => {
      const targetStep = getNthStep(n);
      if (beforeStepChangeCallback) {
        await beforeStepChangeCallback(targetStep);
      }
      await setCurrentStep(targetStep);
    },
    [getNthStep, setCurrentStep, beforeStepChangeCallback],
  );

  const prev = useCallback(async () => {
    const prevStep = getPrevStep();
    if (beforeStepChangeCallback) {
      await beforeStepChangeCallback(prevStep);
    }
    await setCurrentStep(prevStep);
  }, [getPrevStep, setCurrentStep, beforeStepChangeCallback]);

  // Compute isLastStep considering stopAtStep
  const computedIsLastStep = useMemo(() => {
    if (stopAtStep && currentStep) {
      return currentStep.name === stopAtStep;
    }
    return isLastStep;
  }, [stopAtStep, currentStep, isLastStep]);

  const value = useMemo(
    () => ({
      registerStep,
      unregisterStep,
      currentStep,
      start,
      stop,
      visible,
      copilotEvents,
      goToNext: next,
      goToNth: nth,
      goToPrev: prev,
      isFirstStep,
      isLastStep: computedIsLastStep,
      currentStepNumber,
      totalStepsNumber,
      showSkipButton,
      showPreviousButton,
    }),
    [
      registerStep,
      unregisterStep,
      currentStep,
      start,
      stop,
      visible,
      copilotEvents,
      next,
      nth,
      prev,
      isFirstStep,
      computedIsLastStep,
      currentStepNumber,
      totalStepsNumber,
      showSkipButton,
      showPreviousButton,
    ],
  );

  return (
    <CopilotContext.Provider value={value}>
      <>
        <CopilotModal ref={modal} {...rest} />
        {children}
      </>
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const value = useContext(CopilotContext);
  if (value == null) {
    throw new Error("You must wrap your app inside CopilotProvider");
  }

  return value;
};
