
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

type Props = { onNavigate: (screen: string) => void };

const categories = [
  { title: "Road damage", icon: "trail-sign-outline" },
  { title: "Garbage", icon: "trash-outline" },
  { title: "Drainage", icon: "water-outline" },
  { title: "Streetlights", icon: "bulb-outline" },
];

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>✧ COMMUNITY ACTION</Text>
        <Text style={s.heroTitle}>
          See a problem?{"\n"}Let's solve it.
        </Text>
        <Text style={s.heroDescription}>
          Report local issues in a few simple steps and help your city respond better.
        </Text>

        <Pressable style={s.heroButton} onPress={() => onNavigate("report")}>
          <Ionicons name="add" size={21} color={C.primary} />
          <Text style={s.heroButtonText}>Report an Issue</Text>
        </Pressable>

        <View style={s.art}>
          <View style={s.artBuilding}>
            <View style={s.artLine} />
            <View style={s.artLine} />
            <View style={s.artLine} />
          </View>
          <View style={s.artTree} />
          <View style={s.artPin}>
            <Ionicons name="location-outline" size={25} color="#8A5D00" />
          </View>
        </View>
      </View>

      <Text style={s.eyebrow}>YOUR ACTIVITY</Text>
      <Text style={s.sectionTitle}>Making a difference</Text>

      <View style={s.stats}>
        <Stat number="12" label="Reports filed" />
        <View style={s.divider} />
        <Stat number="3" label="Under review" />
        <View style={s.divider} />
        <Stat number="7" label="Resolved" />
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Common issues</Text>
        <Pressable onPress={() => onNavigate("report")}>
          <Text style={s.viewAll}>View all</Text>
        </Pressable>
      </View>

      <View style={s.categoryGrid}>
        {categories.map((item) => (
          <Pressable
            key={item.title}
            style={s.categoryCard}
            onPress={() => onNavigate("report")}
          >
            <View style={s.categoryIcon}>
              <Ionicons name={item.icon as any} size={22} color={C.primary} />
            </View>
            <Text style={s.categoryText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color={C.text} />
          </Pressable>
        ))}
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent reports</Text>
        <Pressable onPress={() => onNavigate("reports")}>
          <Text style={s.viewAll}>See all</Text>
        </Pressable>
      </View>

      <Pressable style={s.recent} onPress={() => onNavigate("reports")}>
        <View style={s.thumb}>
          <Ionicons name="warning-outline" size={25} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.recentTitle}>Large pothole near market road</Text>
          <Text style={s.small}>Today, 9:24 AM</Text>
        </View>
        <Text style={s.status}>Under review</Text>
        <Ionicons name="chevron-forward" size={18} color={C.text} />
      </Pressable>
    </ScrollView>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={s.statNumber}>{number}</Text>
      <Text style={s.small}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 8, paddingTop: 4, paddingBottom: 25 },
  hero: {
    height: 280, backgroundColor: C.primary,
    borderRadius: 28, padding: 23, overflow: "hidden",
  },
  heroEyebrow: {
    color: "#C9E7D9", fontWeight: "900",
    fontSize: 10, letterSpacing: 1,
  },
  heroTitle: {
    color: C.white, fontSize: 29, lineHeight: 34,
    fontWeight: "500", marginTop: 14,
  },
  heroDescription: {
    color: "#E0F0E9", fontSize: 12,
    lineHeight: 18, marginTop: 10, width: "68%",
  },
  heroButton: {
    height: 48, paddingHorizontal: 17,
    borderRadius: 16, backgroundColor: C.white,
    alignSelf: "flex-start", flexDirection: "row",
    alignItems: "center", gap: 8, marginTop: 21,
  },
  heroButtonText: { color: C.primary, fontWeight: "900", fontSize: 13 },
  art: {
    position: "absolute", right: -25, bottom: -18,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "#2F8066",
  },
  artBuilding: {
    position: "absolute", right: 52, bottom: 18,
    width: 94, height: 125, backgroundColor: "#D6EAE1",
    padding: 15, justifyContent: "space-around",
  },
  artLine: { height: 9, backgroundColor: "#77A995" },
  artTree: {
    position: "absolute", left: 38, bottom: 17,
    width: 50, height: 85, backgroundColor: "#8BB77C",
    borderRadius: 28,
  },
  artPin: {
    position: "absolute", right: 42, top: 18,
    width: 48, height: 58, borderRadius: 25,
    backgroundColor: "#F4D98D",
    alignItems: "center", justifyContent: "center",
  },
  eyebrow: {
    color: C.primary, fontSize: 10, fontWeight: "900",
    letterSpacing: 1.6, marginTop: 29, marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20, color: C.text, fontWeight: "500",
    marginTop: 5, marginBottom: 14, marginLeft: 4,
  },
  stats: {
    height: 96, backgroundColor: C.white,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 22, flexDirection: "row",
    alignItems: "center", paddingHorizontal: 9,
  },
  statNumber: { fontSize: 25, color: C.primary, fontWeight: "900" },
  small: { fontSize: 10, color: C.muted, marginTop: 7 },
  divider: { width: 1, height: 52, backgroundColor: C.border },
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 27,
  },
  viewAll: { color: C.primary, fontSize: 12, fontWeight: "900", marginRight: 5 },
  categoryGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "space-between", gap: 10,
  },
  categoryCard: {
    width: "48.5%", minHeight: 78,
    backgroundColor: C.white, borderWidth: 1,
    borderColor: C.border, borderRadius: 20,
    padding: 12, flexDirection: "row",
    alignItems: "center", gap: 8,
  },
  categoryIcon: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  categoryText: {
    flex: 1, fontSize: 11, fontWeight: "800", color: C.text,
  },
  recent: {
    backgroundColor: C.white, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    padding: 11, flexDirection: "row",
    alignItems: "center", gap: 10,
  },
  thumb: {
    width: 58, height: 58, borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  recentTitle: { fontSize: 11, fontWeight: "800", color: C.text },
  status: {
    backgroundColor: "#FFF2D8", color: "#95610B",
    paddingHorizontal: 9, paddingVertical: 7,
    borderRadius: 20, overflow: "hidden", fontSize: 9,
    fontWeight: "800",
  },
});
