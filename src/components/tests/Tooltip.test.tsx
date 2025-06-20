import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Tooltip } from "../default-ui/Tooltip";
import { CopilotProvider } from "../../contexts/CopilotProvider";

// Mock the CopilotProvider context
const mockCopilotContext = {
  goToNext: jest.fn(),
  goToPrev: jest.fn(),
  stop: jest.fn(),
  currentStep: { text: "Test step text" },
  isFirstStep: false,
  isLastStep: false,
  registerStep: jest.fn(),
  unregisterStep: jest.fn(),
  start: jest.fn(),
  visible: false,
  copilotEvents: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  currentStepNumber: 1,
  totalStepsNumber: 3,
  goToNth: jest.fn(),
};

jest.mock("../../contexts/CopilotProvider", () => ({
  useCopilot: () => mockCopilotContext,
}));

describe("Tooltip", () => {
  const defaultLabels = {
    skip: "Skip",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders skip button when showSkipButton is true and not last step", () => {
    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={true}
        showPreviousButton={true}
      />,
    );

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render skip button when showSkipButton is false", () => {
    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={false}
        showPreviousButton={true}
      />,
    );

    expect(screen.queryByText("Skip")).toBeNull();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render previous button when showPreviousButton is false", () => {
    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={true}
        showPreviousButton={false}
      />,
    );

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render both skip and previous buttons when both are disabled", () => {
    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={false}
        showPreviousButton={false}
      />,
    );

    expect(screen.queryByText("Skip")).toBeNull();
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("renders finish button on last step", () => {
    // Mock isLastStep to be true
    const mockLastStepContext = {
      ...mockCopilotContext,
      isLastStep: true,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockLastStepContext,
    }));

    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={true}
        showPreviousButton={true}
      />,
    );

    expect(screen.queryByText("Skip")).toBeNull(); // Skip button should not render on last step
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Finish")).toBeTruthy();
    expect(screen.queryByText("Next")).toBeNull(); // Next button should not render on last step
  });

  it("does not render previous button on first step", () => {
    // Mock isFirstStep to be true
    const mockFirstStepContext = {
      ...mockCopilotContext,
      isFirstStep: true,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockFirstStepContext,
    }));

    render(
      <Tooltip
        labels={defaultLabels}
        showSkipButton={true}
        showPreviousButton={true}
      />,
    );

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.queryByText("Previous")).toBeNull(); // Previous button should not render on first step
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("uses default values when props are not provided", () => {
    render(<Tooltip labels={defaultLabels} />);

    // Should render both buttons by default (showSkipButton=true, showPreviousButton=true)
    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });
});
