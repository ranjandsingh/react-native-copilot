import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Tooltip } from "../default-ui/Tooltip";

// Mock the CopilotProvider context
const createMockContext = (overrides = {}) => ({
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
  showSkipButton: true,
  showPreviousButton: true,
  ...overrides,
});

const mockUseCopilot = jest.fn();

jest.mock("../../contexts/CopilotProvider", () => ({
  useCopilot: () => mockUseCopilot(),
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
    mockUseCopilot.mockReturnValue(createMockContext());
  });

  it("renders skip button when showSkipButton is true and not last step", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        showSkipButton: true,
        showPreviousButton: true,
        isLastStep: false,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render skip button when showSkipButton is false", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        showSkipButton: false,
        showPreviousButton: true,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.queryByText("Skip")).toBeNull();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render previous button when showPreviousButton is false", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        showSkipButton: true,
        showPreviousButton: false,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render both skip and previous buttons when both are disabled", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        showSkipButton: false,
        showPreviousButton: false,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.queryByText("Skip")).toBeNull();
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("renders finish button on last step", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        isLastStep: true,
        showSkipButton: true,
        showPreviousButton: true,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.queryByText("Skip")).toBeNull(); // Skip button should not render on last step
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Finish")).toBeTruthy();
    expect(screen.queryByText("Next")).toBeNull(); // Next button should not render on last step
  });

  it("does not render previous button on first step", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        isFirstStep: true,
        showSkipButton: true,
        showPreviousButton: true,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.queryByText("Previous")).toBeNull(); // Previous button should not render on first step
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("respects context values for button visibility", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        showSkipButton: true,
        showPreviousButton: true,
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    // Should render both buttons based on context values
    expect(screen.getByText("Skip")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("does not render previous button on first step even when showPreviousButton is true", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        isFirstStep: true,
        showPreviousButton: true, // Context says show, but first step logic overrides
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.queryByText("Previous")).toBeNull();
  });

  it("does not render skip button on last step even when showSkipButton is true", () => {
    mockUseCopilot.mockReturnValue(
      createMockContext({
        isLastStep: true,
        showSkipButton: true, // Context says show, but last step logic overrides
      }),
    );

    render(<Tooltip labels={defaultLabels} />);

    expect(screen.queryByText("Skip")).toBeNull();
  });
});
