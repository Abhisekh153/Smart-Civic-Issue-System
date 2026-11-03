
import React, { useState } from "react";
import {
  View, StyleSheet, Pressable, Text, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS as C } from "./constants/theme";

import WelcomeScreen from "./app/screens/WelcomeScreen";
import SignupScreen from "./app/screens/SignupScreen";
import LoginScreen from "./app/screens/LoginScreen";
import HomeScreen from "./app/screens/HomeScreen";
import ReportScreen from "./app/screens/ReportScreen";
import ReportsScreen from "./app/screens/ReportsScreen";
import ProfileScreen from "./app/screens/ProfileScreen";

type Screen =
  | "welcome"
  | "signup"
  | "login"
  | "home"
  | "report"
  | "reports"
  | "profile";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");

  const navigate = (next: string) => {
    setScreen(next as Screen);
  };

  const isMainScreen = [
    "home",
    "report",
    "reports",
    "profile",
  ].includes(screen);

  function renderScreen() {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen onNavigate={navigate} />;

      case "signup":
        return <SignupScreen onNavigate={navigate} />;

      case "login":
        return <LoginScreen onNavigate={navigate} />;

      case "home":
        return <HomeScreen onNavigate={navigate} />;

      case "report":
        return <ReportScreen />;

      case "reports":
        return <ReportsScreen />;

      case "profile":
        return <ProfileScreen />;

      default:
        return <WelcomeScreen onNavigate={navigate} />;
    }
  }

  const tabs = [
    { name: "home", label: "Home", icon: "home-outline" },
    { name: "report", label: "Report", icon: "add" },
    { name: "reports", label: "My Reports", icon: "document-text-outline" },
    { name: "profile", label: "Profile", icon: "person-outline" },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.screen}>
        {renderScreen()}
      </View>

      {isMainScreen && (
        <View style={styles.bottomBar}>
          {tabs.map((tab) => {
            const active = screen === tab.name;

            return (
              <Pressable
                key={tab.name}
                style={styles.tab}
                onPress={() => navigate(tab.name)}
              >
                <View style={[
                  styles.tabIcon,
                  active && tab.name === "report" && styles.reportIcon,
                ]}>
                  <Ionicons
                    name={tab.icon as any}
                    size={tab.name === "report" ? 29 : 23}
                    color={active ? C.primary : "#8A9992"}
                  />
                </View>

                <Text style={[
                  styles.tabLabel,
                  active && styles.activeLabel,
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  screen: {
    flex: 1,
  },

  bottomBar: {
    height: 72,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  tabIcon: {
    height: 32,
    minWidth: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  reportIcon: {
    backgroundColor: C.primary,
    borderRadius: 13,
    width: 42,
    height: 38,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A9992",
  },

  activeLabel: {
    color: C.primary,
    fontWeight: "900",
  },
});
