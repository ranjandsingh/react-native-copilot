import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CopilotProvider,
  CopilotStep,
  walkthroughable,
  useCopilot,
} from "react-native-copilot";

const WalkthroughableText = walkthroughable(Text);
const WalkthroughableImage = walkthroughable(Image);

function App({
  showSkip,
  setShowSkip,
  showPrevious,
  setShowPrevious,
  stepNumberFormat,
  setStepNumberFormat,
}) {
  const { start, copilotEvents } = useCopilot();
  const [secondStepActive, setSecondStepActive] = useState(true);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    copilotEvents.on("stepChange", (step) => {
      setLastEvent(`stepChange: ${step.name}`);
    });
    copilotEvents.on("start", () => {
      setLastEvent(`start`);
    });
    copilotEvents.on("stop", () => {
      setLastEvent(`stop`);
    });
  }, [copilotEvents]);

  return (
    <SafeAreaView style={styles.container}>
      <CopilotStep
        text="Hey! This is the first step of the tour!"
        order={1}
        name="openApp"
      >
        <WalkthroughableText style={styles.title}>
          {'Welcome to the demo of\n"React Native Copilot"'}
        </WalkthroughableText>
      </CopilotStep>
      <View style={styles.middleView}>
        <CopilotStep
          active={secondStepActive}
          text="Here goes your profile picture!"
          order={2}
          name="secondText"
        >
          <WalkthroughableImage
            source={{
              uri: "https://pbs.twimg.com/profile_images/527584017189982208/l3wwN-l-_400x400.jpeg",
            }}
            style={styles.profilePhoto}
          />
        </CopilotStep>
        <View style={styles.activeSwitchContainer}>
          <Text>Profile photo step activated?</Text>
          <View style={{ flexGrow: 1 }} />
          <Switch
            onValueChange={(secondStepActive) =>
              setSecondStepActive(secondStepActive)
            }
            value={secondStepActive}
          />
        </View>

        <View style={styles.activeSwitchContainer}>
          <Text>Show Skip Button?</Text>
          <View style={{ flexGrow: 1 }} />
          <Switch onValueChange={setShowSkip} value={showSkip} />
        </View>

        <View style={styles.activeSwitchContainer}>
          <Text>Show Previous Button?</Text>
          <View style={{ flexGrow: 1 }} />
          <Switch onValueChange={setShowPrevious} value={showPrevious} />
        </View>

        <View style={styles.activeSwitchContainer}>
          <Text>
            Step Number Format:{" "}
            {stepNumberFormat === "current" ? "Current Only" : "Current/Total"}
          </Text>
          <View style={{ flexGrow: 1 }} />
          <Switch
            onValueChange={(value) =>
              setStepNumberFormat(value ? "current_of_total" : "current")
            }
            value={stepNumberFormat === "current_of_total"}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => start()}>
          <Text style={styles.buttonText}>START THE TUTORIAL!</Text>
        </TouchableOpacity>
        <View style={styles.eventContainer}>
          <Text>{lastEvent && `Last event: ${lastEvent}`}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <CopilotStep
          text="Here is an item in the corner of the screen."
          order={3}
          name="thirdText"
        >
          <WalkthroughableText style={styles.tabItem}>
            <Ionicons name="apps" size={25} color="#888" />
          </WalkthroughableText>
        </CopilotStep>

        <Ionicons
          style={styles.tabItem}
          name="airplane"
          size={25}
          color="#888"
        />
        <Ionicons
          style={styles.tabItem}
          name="ios-globe"
          size={25}
          color="#888"
        />
        <Ionicons
          style={styles.tabItem}
          name="ios-navigate-outline"
          size={25}
          color="#888"
        />
        <Ionicons
          style={styles.tabItem}
          name="ios-rainy"
          size={25}
          color="#888"
        />
      </View>
    </SafeAreaView>
  );
}

const AppwithProvider = () => {
  const [showSkip, setShowSkip] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [stepNumberFormat, setStepNumberFormat] = useState("current_of_total");

  return (
    <CopilotProvider
      stopOnOutsideClick
      androidStatusBarVisible
      showSkipButton={showSkip}
      showPreviousButton={showPrevious}
      showStepNumbers={stepNumberFormat}
    >
      <App
        showSkip={showSkip}
        setShowSkip={setShowSkip}
        showPrevious={showPrevious}
        setShowPrevious={setShowPrevious}
        stepNumberFormat={stepNumberFormat}
        setStepNumberFormat={setStepNumberFormat}
      />
    </CopilotProvider>
  );
};

export default AppwithProvider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 25,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginVertical: 20,
  },
  middleView: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#2980b9",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabItem: {
    flex: 1,
    textAlign: "center",
  },
  activeSwitchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 25,
  },
  eventContainer: {
    marginTop: 20,
  },
});
