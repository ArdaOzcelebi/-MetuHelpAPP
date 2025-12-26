import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { createHelpRequest } from "@/src/services/helpRequestService";
import type { HelpRequestCategory } from "@/src/types/helpRequest";

type PostNeedScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "PostNeed">;
};

const CATEGORIES = [
  { id: "medical", labelEn: "Medical", labelTr: "Sağlık", icon: "activity" },
  { id: "academic", labelEn: "Academic", labelTr: "Akademik", icon: "book" },
  {
    id: "transport",
    labelEn: "Transport",
    labelTr: "Ulaşım",
    icon: "navigation",
  },
  { id: "other", labelEn: "Other", labelTr: "Diğer", icon: "help-circle" },
] as const;

const LOCATIONS = [
  { id: "library", labelEn: "Library", labelTr: "Kütüphane" },
  {
    id: "student_center",
    labelEn: "Student Center",
    labelTr: "Öğrenci Merkezi",
  },
  {
    id: "engineering",
    labelEn: "Engineering Building",
    labelTr: "Mühendislik Binası",
  },
  { id: "physics", labelEn: "Physics Building", labelTr: "Fizik Binası" },
  { id: "main_gate", labelEn: "Main Gate", labelTr: "Ana Kapı" },
  { id: "cafeteria", labelEn: "Cafeteria", labelTr: "Kafeterya" },
  { id: "dormitory", labelEn: "Dormitory Area", labelTr: "Yurt Bölgesi" },
  {
    id: "sports_complex",
    labelEn: "Sports Complex",
    labelTr: "Spor Kompleksi",
  },
  { id: "other", labelEn: "Other", labelTr: "Diğer" },
] as const;

export default function PostNeedScreen({ navigation }: PostNeedScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<HelpRequestCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isReturnNeeded, setIsReturnNeeded] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.length > 0 && selectedCategory && selectedLocation;

  const handlePost = async () => {
    if (!isValid || submitting) return;

    if (!user) {
      Alert.alert(t.error, t.mustBeLoggedIn);
      return;
    }

    setSubmitting(true);

    try {
      const userName =
        user.displayName || user.email?.split("@")[0] || "Anonymous";

      await createHelpRequest(
        {
          title,
          category: selectedCategory!,
          description: details,
          location: selectedLocation!,
          isReturnNeeded,
          urgent: isUrgent,
          isAnonymous,
        },
        user.uid,
        user.email || "",
        userName,
      );

      // Reset form state after successful submission
      setTitle("");
      setSelectedCategory(null);
      setSelectedLocation(null);
      setDetails("");
      setIsUrgent(false);
      setIsReturnNeeded(false);
      setIsAnonymous(false);

      // Show success message and navigate back
      Alert.alert(t.requestPosted, t.requestPostedMessage, [
        {
          text: t.ok,
          onPress: () => navigation.goBack(),
        },
      ]);

      // Navigate back after alert is shown (fallback if user doesn't press OK)
      // This ensures the user sees their request was posted successfully
      setTimeout(() => {
        try {
          navigation.goBack();
        } catch (e) {
          // Navigation might have already happened
          console.log("Navigation already completed");
        }
      }, 3000);
    } catch (error) {
      console.error("Error posting request:", error);
      const errorMessage =
        error instanceof Error ? error.message : t.failedToPostRequest;
      Alert.alert(t.error, errorMessage, [{ text: t.ok }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionLabel}>{t.whatDoYouNeed}</ThemedText>
      <TextInput
        style={[
          styles.titleInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder={t.itemNamePlaceholder}
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={(text) => setTitle(text.slice(0, 60))}
        maxLength={60}
      />
      <ThemedText style={[styles.charCount, { color: theme.textSecondary }]}>
        {title.length}/60
      </ThemedText>

      <ThemedText style={styles.sectionLabel}>{t.category}</ThemedText>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id as HelpRequestCategory)}
            style={[
              styles.categoryCard,
              {
                backgroundColor:
                  selectedCategory === cat.id
                    ? isDark
                      ? "#CC3333"
                      : METUColors.maroon
                    : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name={cat.icon as keyof typeof Feather.glyphMap}
              size={24}
              color={selectedCategory === cat.id ? "#FFFFFF" : theme.text}
            />
            <ThemedText
              style={[
                styles.categoryLabel,
                {
                  color: selectedCategory === cat.id ? "#FFFFFF" : theme.text,
                },
              ]}
            >
              {language === "en" ? cat.labelEn : cat.labelTr}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>{t.location}</ThemedText>
      <View style={styles.locationsGrid}>
        {LOCATIONS.map((loc) => (
          <Pressable
            key={loc.id}
            onPress={() =>
              setSelectedLocation(language === "en" ? loc.labelEn : loc.labelTr)
            }
            style={[
              styles.locationChip,
              {
                backgroundColor:
                  selectedLocation ===
                  (language === "en" ? loc.labelEn : loc.labelTr)
                    ? isDark
                      ? "#CC3333"
                      : METUColors.maroon
                    : theme.backgroundDefault,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.locationText,
                {
                  color:
                    selectedLocation ===
                    (language === "en" ? loc.labelEn : loc.labelTr)
                      ? "#FFFFFF"
                      : theme.text,
                },
              ]}
            >
              {language === "en" ? loc.labelEn : loc.labelTr}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>{t.additionalDetails}</ThemedText>
      <TextInput
        style={[
          styles.detailsInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder={t.additionalDetailsPlaceholder}
        placeholderTextColor={theme.textSecondary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Pressable
        onPress={() => setIsReturnNeeded(!isReturnNeeded)}
        style={[
          styles.urgentToggle,
          {
            backgroundColor: isReturnNeeded
              ? "rgba(16, 185, 129, 0.1)"
              : theme.backgroundDefault,
            borderColor: isReturnNeeded
              ? METUColors.actionGreen
              : "transparent",
          },
        ]}
      >
        <View style={styles.urgentToggleContent}>
          <Feather
            name="rotate-ccw"
            size={20}
            color={
              isReturnNeeded ? METUColors.actionGreen : theme.textSecondary
            }
          />
          <View style={styles.urgentToggleText}>
            <ThemedText
              style={[
                styles.urgentLabel,
                {
                  color: isReturnNeeded ? METUColors.actionGreen : theme.text,
                },
              ]}
            >
              {t.isReturnNeeded}
            </ThemedText>
            <ThemedText
              style={[styles.urgentHint, { color: theme.textSecondary }]}
            >
              {t.returnNeededHint}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isReturnNeeded
                ? METUColors.actionGreen
                : "transparent",
              borderColor: isReturnNeeded
                ? METUColors.actionGreen
                : theme.textSecondary,
            },
          ]}
        >
          {isReturnNeeded ? (
            <Feather name="check" size={14} color="#FFFFFF" />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={() => setIsUrgent(!isUrgent)}
        style={[
          styles.urgentToggle,
          {
            backgroundColor: isUrgent
              ? "rgba(220, 38, 38, 0.1)"
              : theme.backgroundDefault,
            borderColor: isUrgent ? METUColors.alertRed : "transparent",
          },
        ]}
      >
        <View style={styles.urgentToggleContent}>
          <Feather
            name="alert-circle"
            size={20}
            color={isUrgent ? METUColors.alertRed : theme.textSecondary}
          />
          <View style={styles.urgentToggleText}>
            <ThemedText
              style={[
                styles.urgentLabel,
                { color: isUrgent ? METUColors.alertRed : theme.text },
              ]}
            >
              {t.markAsUrgent}
            </ThemedText>
            <ThemedText
              style={[styles.urgentHint, { color: theme.textSecondary }]}
            >
              {t.urgentHint}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isUrgent ? METUColors.alertRed : "transparent",
              borderColor: isUrgent ? METUColors.alertRed : theme.textSecondary,
            },
          ]}
        >
          {isUrgent ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
        </View>
      </Pressable>

      <Pressable
        onPress={() => setIsAnonymous(!isAnonymous)}
        style={[
          styles.urgentToggle,
          {
            backgroundColor: isAnonymous
              ? "rgba(128, 128, 128, 0.1)"
              : theme.backgroundDefault,
            borderColor: isAnonymous ? theme.textSecondary : "transparent",
          },
        ]}
      >
        <View style={styles.urgentToggleContent}>
          <Feather
            name="user-x"
            size={20}
            color={isAnonymous ? theme.text : theme.textSecondary}
          />
          <View style={styles.urgentToggleText}>
            <ThemedText style={[styles.urgentLabel, { color: theme.text }]}>
              {t.postAnonymously}
            </ThemedText>
            <ThemedText
              style={[styles.urgentHint, { color: theme.textSecondary }]}
            >
              {t.anonymousHint}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isAnonymous
                ? theme.textSecondary
                : "transparent",
              borderColor: isAnonymous
                ? theme.textSecondary
                : theme.textSecondary,
            },
          ]}
        >
          {isAnonymous ? (
            <Feather name="check" size={14} color="#FFFFFF" />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={handlePost}
        disabled={!isValid || submitting}
        style={({ pressed }) => [
          styles.postButton,
          {
            backgroundColor:
              isValid && !submitting
                ? METUColors.actionGreen
                : theme.backgroundSecondary,
            opacity: pressed && isValid && !submitting ? 0.9 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.postButtonText,
            {
              color: isValid && !submitting ? "#FFFFFF" : theme.textSecondary,
            },
          ]}
        >
          {submitting ? t.posting : t.postRequest}
        </ThemedText>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  titleInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  charCount: {
    fontSize: Typography.caption.fontSize,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  categoryCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryLabel: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  locationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  locationChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  locationText: {
    fontSize: Typography.small.fontSize,
  },
  detailsInput: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  urgentToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
  },
  urgentToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  urgentToggleText: {
    gap: 2,
  },
  urgentLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
  },
  urgentHint: {
    fontSize: Typography.caption.fontSize,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  postButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
  },
  postButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
});
