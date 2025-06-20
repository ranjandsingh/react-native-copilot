import React from "react";
import { render, screen } from "@testing-library/react-native";
import { StepNumber } from "../default-ui/StepNumber";

// Mock the CopilotProvider context
const mockCopilotContext = {
  currentStepNumber: 2,
  totalStepsNumber: 5,
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
  goToNth: jest.fn(),
};

jest.mock("../../contexts/CopilotProvider", () => ({
  useCopilot: () => mockCopilotContext,
}));

describe("StepNumber", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current step number and total steps number by default", () => {
    render(<StepNumber />);

    expect(screen.getByText("2/5")).toBeTruthy();
  });

  it("renders only current step number when showStepNumbers is 'current'", () => {
    render(<StepNumber showStepNumbers="current" />);

    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.queryByText("2/5")).toBeNull();
  });

  it("renders current/total when showStepNumbers is 'current_of_total'", () => {
    render(<StepNumber showStepNumbers="current_of_total" />);

    expect(screen.getByText("2/5")).toBeTruthy();
  });

  it("renders correctly for first step", () => {
    const mockFirstStepContext = {
      ...mockCopilotContext,
      currentStepNumber: 1,
      totalStepsNumber: 3,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockFirstStepContext,
    }));

    render(<StepNumber />);

    expect(screen.getByText("1/3")).toBeTruthy();
  });

  it("renders correctly for last step", () => {
    const mockLastStepContext = {
      ...mockCopilotContext,
      currentStepNumber: 5,
      totalStepsNumber: 5,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockLastStepContext,
    }));

    render(<StepNumber />);

    expect(screen.getByText("5/5")).toBeTruthy();
  });

  it("renders correctly with large numbers", () => {
    const mockLargeNumberContext = {
      ...mockCopilotContext,
      currentStepNumber: 12,
      totalStepsNumber: 25,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockLargeNumberContext,
    }));

    render(<StepNumber />);

    expect(screen.getByText("12/25")).toBeTruthy();
  });

  it("renders correctly with single digit total", () => {
    const mockSingleDigitContext = {
      ...mockCopilotContext,
      currentStepNumber: 1,
      totalStepsNumber: 1,
    };

    jest.doMock("../../contexts/CopilotProvider", () => ({
      useCopilot: () => mockSingleDigitContext,
    }));

    render(<StepNumber />);

    expect(screen.getByText("1/1")).toBeTruthy();
  });
});
