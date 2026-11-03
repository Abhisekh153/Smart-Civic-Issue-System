
import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS as C } from "../../constants/theme";

const groups = [
  [
    { icon: "person-outline", title: "Personal information" },
    { icon: "document-text-outline", title: "My reports" },
    { icon: "notifications-outline", title: "Notifications", badge: "2" },
  ],
  [
    { icon: "shield-checkmark-outline", title: "Privacy & security" },
    { icon: "help-circle-outline", title: "Help & support" },
    { icon: "information-circle-outline", title: "About Civic Intelligence" },
  ],
];

export default function ProfileScreen() {
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.logo}>
          <Ionicons name="stats-chart" size={24} color={C.white} />
        </View>
        <Text style={s.heading}>Profile</Text>
        <Pressable
          style={s.edit}
          onPress={() => Alert.alert("Profile", "Profile editing will be implemented later.")}
        >
          <Ionicons name="pencil-outline" size={20} color={C.text} />
        </Pressable>
      </View>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.initials}>CN</Text>
        </View>

        <Text style={s.name}>Citizen Name</Text>
        <Text style={s.email}>citizen@example.com</Text>

        <View style={s.divider} />

        <View style={s.stats}>
          <ProfileStat number="12" label="Reports" />
          <View style={s.statDivider} />
          <ProfileStat number="7" label="Resolved" />
          <View style={s.statDivider} />
          <ProfileStat number="1 yr" label="Member" />
        </View>
      </View>

      {groups.map((group, index) => (
        <View key={index} style={s.group}>
          {group.map((item, i) => (
            <Pressable
              key={item.title}
              style={[
                s.item,
                i === group.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => Alert.alert(item.title, "This section will be implemented later.")}
            >
              <View style={s.itemIcon}>
                <Ionicons name={item.icon as any} size={21} color={C.primary} />
              </View>

              <Text style={s.itemTitle}>{item.title}</Text>

              {"badge" in item && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{item.badge}</Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={19} color={C.text} />
            </Pressable>
          ))}
        </View>
      ))}

      <Pressable
        style={s.logout}
        onPress={() => Alert.alert("Log out", "Authentication is not connected yet.")}
      >
        <Ionicons name="log-out-outline" size={20} color={C.danger} />
        <Text style={s.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileStat({ number, label }: { number: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={s.statNumber}>{number}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  content: { padding: 14, paddingTop: 12, paddingBottom: 30 },
  header: {
    height: 52, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  logo: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.primary, alignItems: "center",
    justifyContent: "center",
  },
  heading: { fontSize: 19, fontWeight: "900", color: C.text },
  edit: {
    width: 44, height: 44, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.white, alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: C.white, borderRadius: 24,
    borderWidth: 1, borderColor: C.border,
    padding: 23, alignItems: "center", marginTop: 5, marginBottom: 15,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: C.primary, alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 28, color: C.white, fontWeight: "900" },
  name: { fontSize: 21, color: C.text, marginTop: 13 },
  email: { fontSize: 11, color: C.muted, marginTop: 5 },
  divider: {
    height: 1, backgroundColor: C.border,
    width: "100%", marginVertical: 20,
  },
  stats: {
    flexDirection: "row", width: "100%", alignItems: "center",
  },
  statNumber: { fontSize: 16, color: C.primary, fontWeight: "900" },
  statLabel: { fontSize: 9, color: C.muted, marginTop: 5 },
  statDivider: { width: 1, height: 34, backgroundColor: C.border },
  group: {
    backgroundColor: C.white, borderRadius: 21,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 15, marginBottom: 14,
  },
  item: {
    height: 66, flexDirection: "row",
    alignItems: "center", gap: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  itemIcon: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  itemTitle: { flex: 1, fontSize: 12, color: C.text, fontWeight: "900" },
  badge: {
    width: 23, height: 23, borderRadius: 12,
    backgroundColor: C.danger, alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: C.white, fontSize: 10, fontWeight: "900" },
  logout: {
    height: 58, borderRadius: 18,
    backgroundColor: "#FFF2F1", borderWidth: 1,
    borderColor: "#F4D8D5", flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 10,
  },
  logoutText: { color: C.danger, fontWeight: "900" },
});
