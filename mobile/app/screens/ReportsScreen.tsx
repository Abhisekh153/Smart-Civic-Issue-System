
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

const reports = [
  {
    id: "CIV-2026-001",
    title: "Large pothole near market road",
    date: "Today, 9:24 AM",
    status: "Under review",
    color: "#A36B12",
    bg: "#FFF2D8",
    icon: "warning-outline",
  },
  {
    id: "CIV-2026-002",
    title: "Garbage accumulation near bus stop",
    date: "Yesterday, 4:10 PM",
    status: "Resolved",
    color: C.success,
    bg: "#E5F4EC",
    icon: "trash-outline",
  },
  {
    id: "CIV-2026-003",
    title: "Blocked drainage near residential lane",
    date: "29 Oct 2026",
    status: "In progress",
    color: "#2871A8",
    bg: "#E8F2FA",
    icon: "water-outline",
  },
];

export default function ReportsScreen() {
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>YOUR CONTRIBUTION</Text>
      <Text style={s.heading}>My Reports</Text>
      <Text style={s.subtitle}>
        Follow the progress of issues you've reported.
      </Text>

      <View style={s.filters}>
        <Text style={s.activeFilter}>All reports</Text>
        <Text style={s.filter}>Active</Text>
        <Text style={s.filter}>Resolved</Text>
      </View>

      {reports.map((report) => (
        <Pressable key={report.id} style={s.card}>
          <View style={s.thumb}>
            <Ionicons name={report.icon as any} size={25} color={C.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.title}>{report.title}</Text>
            <Text style={s.id}>{report.id}</Text>
            <Text style={s.date}>{report.date}</Text>

            <View style={[s.status, { backgroundColor: report.bg }]}>
              <Text style={{ color: report.color, fontSize: 10, fontWeight: "900" }}>
                {report.status}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={19} color={C.text} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  content: { padding: 20, paddingTop: 58, paddingBottom: 30 },
  eyebrow: {
    fontSize: 10, color: C.primary,
    fontWeight: "900", letterSpacing: 1.6,
  },
  heading: { fontSize: 29, color: C.text, marginTop: 8 },
  subtitle: {
    fontSize: 13, color: C.muted,
    marginTop: 7, marginBottom: 22,
  },
  filters: { flexDirection: "row", gap: 10, marginBottom: 18 },
  activeFilter: {
    backgroundColor: C.primary, color: C.white,
    paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 20, overflow: "hidden",
    fontSize: 11, fontWeight: "900",
  },
  filter: {
    backgroundColor: C.white, color: C.muted,
    paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 20, overflow: "hidden",
    fontSize: 11, fontWeight: "700",
    borderWidth: 1, borderColor: C.border,
  },
  card: {
    backgroundColor: C.white, borderWidth: 1,
    borderColor: C.border, borderRadius: 20,
    padding: 13, marginBottom: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  thumb: {
    width: 58, height: 62, borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 12, fontWeight: "900", color: C.text, lineHeight: 18 },
  id: { fontSize: 10, color: C.primary, marginTop: 5 },
  date: { fontSize: 10, color: C.muted, marginTop: 4 },
  status: {
    alignSelf: "flex-start", paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 20, marginTop: 8,
  },
});
