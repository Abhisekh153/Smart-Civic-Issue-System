
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

type Props = { onNavigate: (screen: string) => void };

export default function WelcomeScreen({ onNavigate }: Props) {
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.illustration}>
        <View style={s.sun} />
        <View style={[s.building, { left: 35, width: 110, height: 155 }]} />
        <View style={[s.building, { right: 25, width: 145, height: 115 }]} />
        <View style={s.treeTrunk} />
        <View style={s.treeOne} />
        <View style={s.treeTwo} />
        <View style={s.pin}>
          <Ionicons name="location" size={28} color={C.white} />
        </View>
        <View style={s.ground} />
      </View>

      <View style={s.body}>
        <Text style={s.eyebrow}>CIVIC INTELLIGENCE</Text>
        <Text style={s.title}>
          Make your{"\n"}neighbourhood better.
        </Text>
        <Text style={s.subtitle}>
          Report civic issues, share evidence and help authorities
          understand what needs attention.
        </Text>

        <Feature
          icon="camera-outline"
          title="Report an issue"
          description="Share a photo and describe what happened."
        />
        <Feature
          icon="sparkles-outline"
          title="AI-assisted analysis"
          description="Get a helpful draft you can review and edit."
        />
        <Feature
          icon="document-text-outline"
          title="Track progress"
          description="Follow every update through to resolution."
        />

        <Pressable
          style={s.button}
          onPress={() => onNavigate("signup")}
        >
          <Text style={s.buttonText}>Get started</Text>
        </Pressable>

        <Pressable
          style={s.login}
          onPress={() => onNavigate("login")}
        >
          <Text style={s.muted}>Already have an account? </Text>
          <Text style={s.link}>Log in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Feature({ icon, title, description }: any) {
  return (
    <View style={s.feature}>
      <View style={s.featureIcon}>
        <Ionicons name={icon} size={22} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.featureTitle}>{title}</Text>
        <Text style={s.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  content: { paddingBottom: 20 },
  illustration: {
    height: 350, margin: 4, backgroundColor: "#EAF5F0",
    borderBottomLeftRadius: 34, borderBottomRightRadius: 34,
    overflow: "hidden", position: "relative",
  },
  sun: {
    position: "absolute", width: 78, height: 78,
    borderRadius: 39, backgroundColor: "#F5E2A9",
    right: 58, top: 52,
  },
  building: {
    position: "absolute", bottom: 42, borderWidth: 2,
    borderColor: "#A9CFC0", backgroundColor: "#F8FBF9",
  },
  treeTrunk: {
    position: "absolute", width: 15, height: 68,
    bottom: 36, left: "38%", backgroundColor: "#8D7452",
  },
  treeOne: {
    position: "absolute", width: 105, height: 105,
    borderRadius: 55, bottom: 70, left: "25%",
    backgroundColor: "#4E9274",
  },
  treeTwo: {
    position: "absolute", width: 88, height: 88,
    borderRadius: 48, bottom: 91, left: "35%",
    backgroundColor: "#5E9F80",
  },
  pin: {
    position: "absolute", bottom: 107, left: "47%",
    width: 57, height: 68, borderRadius: 30,
    backgroundColor: C.primary, alignItems: "center",
    justifyContent: "center", borderWidth: 7,
    borderColor: "#C9E4D9",
  },
  ground: {
    position: "absolute", bottom: 0, height: 44,
    width: "110%", left: -15, backgroundColor: "#B5D8CA",
    borderTopLeftRadius: 100, borderTopRightRadius: 100,
  },
  body: { paddingHorizontal: 30, paddingTop: 42 },
  eyebrow: {
    color: C.primary, fontSize: 12,
    fontWeight: "900", letterSpacing: 1.8,
  },
  title: {
    fontSize: 36, lineHeight: 42, color: C.text,
    marginTop: 16, letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 16, lineHeight: 25, color: C.muted, marginTop: 14,
  },
  feature: {
    flexDirection: "row", alignItems: "center",
    gap: 16, marginTop: 19,
  },
  featureIcon: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  featureTitle: { color: C.text, fontSize: 15, fontWeight: "800" },
  featureDescription: { color: C.muted, fontSize: 12, marginTop: 5 },
  button: {
    marginTop: 29, height: 64, backgroundColor: C.primary,
    borderRadius: 19, alignItems: "center", justifyContent: "center",
  },
  buttonText: { color: C.white, fontWeight: "900", fontSize: 16 },
  login: {
    flexDirection: "row", justifyContent: "center", marginTop: 20,
  },
  muted: { color: C.muted, fontSize: 14 },
  link: { color: C.primary, fontWeight: "900", fontSize: 14 },
});
