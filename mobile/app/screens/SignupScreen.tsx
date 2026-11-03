import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  Pressable, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

type Props = { onNavigate: (screen: string) => void };

export default function SignupScreen({ onNavigate }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function createAccount() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      Alert.alert("Check your details", "Enter your name, email and a password of at least 8 characters.");
      return;
    }
    Alert.alert("Demo account", "Authentication will be connected later.");
    onNavigate("home");
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Pressable style={s.back} onPress={() => onNavigate("welcome")}>
        <Ionicons name="chevron-back" size={25} color={C.text} />
      </Pressable>

      <View style={s.brandRow}>
        <View style={s.logo}>
          <Ionicons name="stats-chart" size={28} color={C.white} />
        </View>
        <View>
          <Text style={s.brand}>Civic</Text>
          <Text style={s.brandSub}>INTELLIGENCE</Text>
        </View>
      </View>

      <Text style={s.eyebrow}>JOIN YOUR COMMUNITY</Text>
      <Text style={s.heading}>Create your account</Text>
      <Text style={s.subtitle}>
        Start reporting and tracking issues in your neighbourhood.
      </Text>

      <Field label="Full name" icon="person-outline"
        placeholder="Enter your full name" value={name}
        onChangeText={setName} />

      <Field label="Email address" icon="mail-outline"
        placeholder="you@example.com" value={email}
        onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" />

      <Text style={s.label}>Password</Text>
      <View style={s.field}>
        <Ionicons name="lock-closed-outline" size={20} color={C.muted} />
        <TextInput
          style={s.input}
          placeholder="Minimum 8 characters"
          placeholderTextColor="#9AA6A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
        />
        <Pressable onPress={() => setShow(!show)}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"}
            size={21} color={C.muted} />
        </Pressable>
      </View>

      <Pressable style={s.button} onPress={createAccount}>
        <Text style={s.buttonText}>Create account</Text>
      </Pressable>

      <View style={s.separator}>
        <View style={s.line} />
        <Text style={s.or}>or continue with</Text>
        <View style={s.line} />
      </View>

      <Pressable style={s.google} onPress={() =>
        Alert.alert("Coming soon", "Google authentication will be added later.")
      }>
        <Ionicons name="logo-google" size={21} color={C.text} />
        <Text style={s.googleText}>Continue with Google</Text>
      </Pressable>

      <Pressable style={s.bottom} onPress={() => onNavigate("login")}>
        <Text style={s.muted}>Already have an account? </Text>
        <Text style={s.link}>Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, icon, ...props }: any) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.field}>
        <Ionicons name={icon} size={20} color={C.muted} />
        <TextInput style={s.input} placeholderTextColor="#9AA6A0" {...props} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.white },
  content: { paddingHorizontal: 29, paddingTop: 10, paddingBottom: 35 },
  back: {
    width: 50, height: 50, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row", alignItems: "center", gap: 13,
    marginTop: 28, marginBottom: 50,
  },
  logo: {
    width: 54, height: 54, borderRadius: 17,
    backgroundColor: C.primary, alignItems: "center",
    justifyContent: "center",
  },
  brand: { color: C.text, fontSize: 23, fontWeight: "900" },
  brandSub: {
    color: C.primary, fontSize: 10, fontWeight: "900",
    letterSpacing: 2.2,
  },
  eyebrow: {
    color: C.primary, fontWeight: "900",
    letterSpacing: 1.5, fontSize: 11,
  },
  heading: { color: C.text, fontSize: 35, marginTop: 10 },
  subtitle: {
    color: C.muted, fontSize: 16, lineHeight: 25,
    marginTop: 12, marginBottom: 16,
  },
  label: {
    color: C.text, fontWeight: "800", fontSize: 13,
    marginBottom: 10, marginLeft: 3,
  },
  field: {
    minHeight: 64, borderWidth: 1, borderColor: C.border,
    backgroundColor: "#FAFCFB", borderRadius: 17,
    paddingHorizontal: 16, flexDirection: "row",
    alignItems: "center", gap: 13,
  },
  input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 14 },
  button: {
    height: 64, borderRadius: 18, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center", marginTop: 25,
  },
  buttonText: { color: C.white, fontSize: 16, fontWeight: "900" },
  separator: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginTop: 20, marginBottom: 38,
  },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  or: { color: C.muted, fontSize: 12 },
  google: {
    height: 64, borderWidth: 1, borderColor: C.border,
    borderRadius: 17, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 13,
  },
  googleText: { color: C.text, fontSize: 15, fontWeight: "800" },
  bottom: { flexDirection: "row", justifyContent: "center", marginTop: 27 },
  muted: { color: C.muted, fontSize: 13 },
  link: { color: C.primary, fontWeight: "900", fontSize: 13 },
});
