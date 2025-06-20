import React, { type FunctionComponent } from "react";
import { Text, View } from "react-native";
import { useCopilot } from "../../contexts/CopilotProvider";

import { styles } from "../style";

export interface StepNumberProps {
  showStepNumbers?: "current" | "current_of_total";
}

export const StepNumber: FunctionComponent<StepNumberProps> = ({
  showStepNumbers = "current_of_total",
}) => {
  const { currentStepNumber, totalStepsNumber } = useCopilot();

  const displayText =
    showStepNumbers === "current"
      ? currentStepNumber.toString()
      : `${currentStepNumber}/${totalStepsNumber}`;

  return (
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{displayText}</Text>
    </View>
  );
};
