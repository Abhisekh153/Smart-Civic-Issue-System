
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Image, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { COLORS as C } from "../../constants/theme";

export default function ReportScreen() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function choosePhoto(camera: boolean) {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to continue.");
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function getLocation() {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Location permission", "Please allow location access.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      Alert.alert("Location unavailable", "Could not retrieve your location.");
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step === 1) {
      if (!photo && !description.trim()) {
        Alert.alert("Add evidence", "Upload a photograph or describe the issue.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (!coordinates) {
      Alert.alert("Location required", "Please capture your location before submitting.");
      return;
    }

    Alert.alert(
      "Demo submission",
      "Your report is ready. Backend submission will be implemented later."
    );

    setStep(1);
    setPhoto(null);
    setDescription("");
    setCoordinates(null);
  }

  return (
    <View style={s.page}>
      <View style={s.topbar}>
        <Pressable
          style={s.back}
          onPress={() => {
            if (step > 1) setStep(step - 1);
            else Alert.alert("Report", "Use the Home tab to leave this screen.");
          }}
        >
          <Ionicons name="chevron-back" size={23} color={C.text} />
        </Pressable>
        <Text style={s.topTitle}>Report an Issue</Text>
        <Pressable onPress={() =>
          Alert.alert("Draft", "Draft saving will be added later.")
        }>
          <Text style={s.save}>Save draft</Text>
        </Pressable>
      </View>

      <View style={s.stepper}>
        {["Evidence", "AI review", "Submit"].map((label, index) => (
          <View key={label} style={s.stepItem}>
            <View style={[s.circle, step >= index + 1 && s.activeCircle]}>
              <Text style={[s.number, step >= index + 1 && s.activeNumber]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[s.stepLabel, step >= index + 1 && s.activeLabel]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <>
            <SectionHeading
              number="1"
              title="Add a photograph"
              subtitle="A clear photo helps us understand the issue."
            />

            <View style={s.upload}>
              {photo ? (
                <Image source={{ uri: photo }} style={s.preview} />
              ) : (
                <>
                  <View style={s.uploadIcon}>
                    <Ionicons name="camera-outline" size={30} color={C.primary} />
                  </View>
                  <Text style={s.uploadTitle}>Add a photo</Text>
                  <Text style={s.hint}>Take a new photo or choose from gallery</Text>

                  <View style={s.photoActions}>
                    <Pressable style={s.outlineButton} onPress={() => choosePhoto(true)}>
                      <Ionicons name="camera-outline" color={C.primary} size={17} />
                      <Text style={s.outlineText}>Camera</Text>
                    </Pressable>
                    <Pressable style={s.outlineButton} onPress={() => choosePhoto(false)}>
                      <Ionicons name="image-outline" color={C.primary} size={17} />
                      <Text style={s.outlineText}>Gallery</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            {photo && (
              <Pressable onPress={() => setPhoto(null)}>
                <Text style={s.remove}>Remove photo</Text>
              </Pressable>
            )}

            <SectionHeading
              number="2"
              title="Describe what happened"
              subtitle="Use your own words — no technical details needed."
            />

            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              placeholder="Tell us what happened, where it happened and why it is a concern..."
              placeholderTextColor="#9AA6A0"
              style={s.description}
            />

            <SectionHeading
              number="3"
              title="Add the location"
              subtitle="Help the right team find the exact spot."
            />

            <Pressable style={s.locationBox} onPress={getLocation} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={C.primary} />
              ) : (
                <Ionicons name="location-outline" size={23} color={C.primary} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.locationTitle}>
                  {coordinates ? "Location captured" : "Use my current location"}
                </Text>
                <Text style={s.hint}>
                  {coordinates
                    ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                    : "GPS location will be attached to your report"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={19} color={C.muted} />
            </Pressable>
          </>
        )}

        {step === 2 && (
          <>
            <View style={s.aiBadge}>
              <Ionicons name="sparkles" size={17} color={C.primary} />
              <Text style={s.aiText}>AI-ASSISTED REVIEW</Text>
            </View>

            <Text style={s.reviewTitle}>Let's review your report</Text>
            <Text style={s.reviewSubtitle}>
              This is a preview. Actual AI image analysis will be connected later.
            </Text>

            {photo && <Image source={{ uri: photo }} style={s.reviewImage} />}

            <View style={s.card}>
              <Text style={s.cardLabel}>SUGGESTED CATEGORY</Text>
              <Text style={s.cardValue}>Awaiting image analysis</Text>
              <Text style={s.hint}>No category has been verified yet.</Text>
            </View>

            <Text style={s.label}>Your description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              style={[s.description, { minHeight: 145 }]}
            />

            <View style={s.notice}>
              <Ionicons name="information-circle-outline" size={20} color={C.primary} />
              <Text style={s.noticeText}>
                AI-generated information will be a suggestion. You can review and edit it.
              </Text>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={s.doneIcon}>
              <Ionicons filter="clipboard-check" size={38} color={C.primary} />
            </View>

            <Text style={s.reviewTitle}>Review before submitting</Text>
            <Text style={s.reviewSubtitle}>
              Check that the information below is correct.
            </Text>

            {photo && <Image source={{ uri: photo }} style={s.reviewImage} />}

            <View style={s.card}>
              <Text style={s.cardLabel}>DESCRIPTION</Text>
              <Text style={s.cardValue}>{description || "No description provided."}</Text>
            </View>

            <View style={s.card}>
              <Text style={s.cardLabel}>LOCATION</Text>
              <Text style={s.cardValue}>
                {coordinates
                  ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                  : "Location not added"}
              </Text>
            </View>

            <Pressable onPress={() => setStep(1)}>
              <Text style={s.editLink}>Edit report details</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={s.continueButton} onPress={nextStep}>
          <Text style={s.continueText}>
            {step === 1
              ? "Continue to AI review"
              : step === 2
              ? "Review submission"
              : "Submit Report"}
          </Text>
          <Ionicons name="arrow-forward" size={19} color={C.white} />
        </Pressable>
      </View>
    </View>
  );
}

function SectionHeading({ number, title, subtitle }: any) {
  return (
    <View style={s.sectionHeading}>
      <View style={s.numberBox}>
        <Text style={s.numberText}>{number}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={s.hint}>{subtitle}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  topbar: {
    height: 62, backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 15,
  },
  back: {
    width: 42, height: 42, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  topTitle: { fontWeight: "900", fontSize: 16, color: C.text },
  save: { color: C.primary, fontSize: 12, fontWeight: "800" },
  stepper: {
    height: 85, backgroundColor: C.white,
    flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.border,
  },
  stepItem: { alignItems: "center", gap: 6, width: "30%" },
  circle: {
    width: 29, height: 29, borderRadius: 15,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  activeCircle: { backgroundColor: C.primary, borderColor: C.primary },
  number: { fontSize: 11, color: C.muted, fontWeight: "800" },
  activeNumber: { color: C.white },
  stepLabel: { fontSize: 10, color: C.muted },
  activeLabel: { color: C.primary, fontWeight: "900" },
  content: { padding: 20, paddingBottom: 25 },
  sectionHeading: {
    flexDirection: "row", gap: 13,
    alignItems: "flex-start", marginTop: 9, marginBottom: 16,
  },
  numberBox: {
    width: 31, height: 31, borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  numberText: { color: C.primary, fontWeight: "900" },
  sectionTitle: { fontSize: 17, color: C.text },
  hint: { fontSize: 11, color: C.muted, marginTop: 5, lineHeight: 16 },
  upload: {
    minHeight: 220, borderWidth: 1, borderStyle: "dashed",
    borderColor: "#B9D2C7", backgroundColor: "#FBFDFC",
    borderRadius: 23, alignItems: "center",
    justifyContent: "center", padding: 18, overflow: "hidden",
  },
  uploadIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  uploadTitle: { fontSize: 14, color: C.text, fontWeight: "900" },
  photoActions: { flexDirection: "row", gap: 10, marginTop: 17 },
  outlineButton: {
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.white, borderRadius: 13,
    paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 7,
  },
  outlineText: { color: C.primary, fontSize: 11, fontWeight: "800" },
  preview: { width: "100%", height: 210, borderRadius: 16 },
  remove: { color: C.danger, textAlign: "right", marginTop: 8, fontWeight: "800" },
  description: {
    minHeight: 145, backgroundColor: C.white,
    borderRadius: 21, borderWidth: 1, borderColor: C.border,
    padding: 17, fontSize: 13, lineHeight: 22,
    color: C.text, marginBottom: 22,
  },
  locationBox: {
    backgroundColor: C.white, borderWidth: 1,
    borderColor: C.border, borderRadius: 18,
    padding: 16, flexDirection: "row",
    alignItems: "center", gap: 12,
  },
  locationTitle: { fontSize: 13, fontWeight: "800", color: C.text },
  footer: {
    padding: 15, paddingBottom: 18, backgroundColor: C.white,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  continueButton: {
    height: 55, backgroundColor: C.primary,
    borderRadius: 16, alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: 10,
  },
  continueText: { color: C.white, fontSize: 14, fontWeight: "900" },
  aiBadge: {
    alignSelf: "flex-start", backgroundColor: C.primaryLight,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: "row", gap: 7, alignItems: "center",
  },
  aiText: { fontSize: 10, color: C.primary, fontWeight: "900", letterSpacing: 1 },
  reviewTitle: { fontSize: 25, fontWeight: "700", color: C.text, marginTop: 18 },
  reviewSubtitle: {
    fontSize: 13, lineHeight: 20, color: C.muted,
    marginTop: 8, marginBottom: 18,
  },
  reviewImage: { width: "100%", height: 190, borderRadius: 18, marginBottom: 15 },
  card: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 17, padding: 16, marginBottom: 13,
  },
  cardLabel: { fontSize: 10, color: C.primary, fontWeight: "900", letterSpacing: 1 },
  cardValue: { fontSize: 14, color: C.text, fontWeight: "700", marginTop: 8, lineHeight: 21 },
  label: { fontSize: 13, color: C.text, fontWeight: "900", marginBottom: 9 },
  notice: {
    backgroundColor: C.primaryLight, padding: 14,
    borderRadius: 15, flexDirection: "row", gap: 10, alignItems: "center",
  },
  noticeText: { flex: 1, fontSize: 11, color: C.primary, lineHeight: 17 },
  doneIcon: {
    width: 75, height: 75, borderRadius: 24,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center", marginTop: 12,
  },
  editLink: { color: C.primary, fontWeight: "900", marginTop: 7 },
});
