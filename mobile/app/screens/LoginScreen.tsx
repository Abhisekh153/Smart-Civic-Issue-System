
import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  Pressable, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

type Props = { onNavigate: (screen: string) => void };

export default function LoginScreen({ onNavigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Pressable style={s.back} onPress={() => onNavigate("welcome")}>
        <Ionicons name="chevron-back" size={25} color={C.text} />
      </Pressable>

      <View style={s.logo}>
        <Ionicons name="stats-chart" size={28} color={C.white} />
      </View>

      <Text style={s.eyebrow}>WELCOME BACK</Text>
      <Text style={s.heading}>Log in to Civic</Text>
      <Text style={s.subtitle}>
        Continue making a difference in your neighbourhood.
      </Text>

      <Text style={s.label}>Email address</Text>
      <View style={s.field}>
        <Ionicons name="mail-outline" size={20} color={C.muted} />
        <TextInput
          style={s.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={s.label}>Password</Text>
      <View style={s.field}>
        <Ionicons name="lock-closed-outline" size={20} color={C.muted} />
        <TextInput
          style={s.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Pressable style={s.forgot} onPress={() =>
        Alert.alert("Coming soon", "Password recovery will be added later.")
      }>
        <Text style={s.link}>Forgot password?</Text>
      </Pressable>

      <Pressable style={s.button} onPress={() => {
        if (!email || !password) {
          Alert.alert("Missing details", "Enter your email and password.");
          return;
        }
        onNavigate("home");
      }}>
        <Text style={s.buttonText}>Log in</Text>
      </Pressable>

      <Pressable style={s.bottom} onPress={() => onNavigate("signup")}>
        <Text style={s.muted}>Don't have an account? </Text>
        <Text style={s.link}>Create account</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  content: { padding: 28, paddingTop: 10 },
  back: {
    width: 50, height: 50, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  logo: {
    width: 58, height: 58, borderRadius: 18,
    backgroundColor: C.primary, alignItems: "center",
    justifyContent: "center", marginTop: 45, marginBottom: 38,
  },
  eyebrow: {
    color: C.primary, fontSize: 11,
    fontWeight: "900", letterSpacing: 1.5,
  },
  heading: { fontSize: 35, color: C.text, marginTop: 10 },
  subtitle: {
    fontSize: 15, color: C.muted, lineHeight: 23,
    marginTop: 10, marginBottom: 30,
  },
  label: {
    fontSize: 13, fontWeight: "800", color: C.text,
    marginBottom: 10, marginTop: 17,
  },
  field: {
    height: 62, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, backgroundColor: "#FAFCFB",
    paddingHorizontal: 15, flexDirection: "row",
    alignItems: "center", gap: 12,
  },
  input: { flex: 1, fontSize: 15, color: C.text },
  forgot: { alignSelf: "flex-end", marginTop: 15 },
  link: { color: C.primary, fontWeight: "900" },
  button: {
    height: 62, backgroundColor: C.primary,
    borderRadius: 17, alignItems: "center",
    justifyContent: "center", marginTop: 28,
  },
  buttonText: { color: C.white, fontWeight: "900", fontSize: 16 },
  bottom: {
    flexDirection: "row", justifyContent: "center", marginTop: 30,
  },
  muted: { color: C.muted },
});
