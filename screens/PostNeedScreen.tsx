import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type PostNeedScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "PostNeed">;
};

const CATEGORIES = [
  { id: "medical", label: "Medical", icon: "activity" },
  { id: "academic", label: "Academic", icon: "book" },
  { id: "transport", label: "Transport", icon: "navigation" },
  { id: "other", label: "Other", icon: "help-circle" },
] as const;

const LOCATIONS = [
  "Library",
  "Student Center",
  "Engineering Building",
  "Physics Building",
  "Main Gate",
  "Cafeteria",
  "Dormitory Area",
  "Sports Complex",
  "Other",
] as const;

export default function PostNeedScreen({ navigation }: PostNeedScreenProps) {
  const { theme, isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const isValid = title.length > 0 && selectedCategory && selectedLocation;

  const handlePost = () => {
    if (!isValid) return;

    Alert.alert(
      "Request Posted!",
      "Your request has been posted. Fellow students will be notified.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionLabel}>What do you need?</ThemedText>
      <TextInput
        style={[
          styles.titleInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder="e.g., Need 1 Bandage"
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={(text) => setTitle(text.slice(0, 60))}
        maxLength={60}
      />
      <ThemedText style={[styles.charCount, { color: theme.textSecondary }]}>
        {title.length}/60
      </ThemedText>

      <ThemedText style={styles.sectionLabel}>Category</ThemedText>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
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
              {cat.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>Location</ThemedText>
      <View style={styles.locationsGrid}>
        {LOCATIONS.map((loc) => (
          <Pressable
            key={loc}
            onPress={() => setSelectedLocation(loc)}
            style={[
              styles.locationChip,
              {
                backgroundColor:
                  selectedLocation === loc
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
                  color: selectedLocation === loc ? "#FFFFFF" : theme.text,
                },
              ]}
            >
              {loc}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>
        Additional Details (Optional)
      </ThemedText>
      <TextInput
        style={[
          styles.detailsInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder="Any extra info that might help..."
        placeholderTextColor={theme.textSecondary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

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
              Mark as Urgent
            </ThemedText>
            <ThemedText
              style={[styles.urgentHint, { color: theme.textSecondary }]}
            >
              Use only for time-sensitive requests
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isUrgent
                ? METUColors.alertRed
                : "transparent",
              borderColor: isUrgent ? METUColors.alertRed : theme.textSecondary,
            },
          ]}
        >
          {isUrgent ? (
            <Feather name="check" size={14} color="#FFFFFF" />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={handlePost}
        disabled={!isValid}
        style={({ pressed }) => [
          styles.postButton,
          {
            backgroundColor: isValid
              ? METUColors.actionGreen
              : theme.backgroundSecondary,
            opacity: pressed && isValid ? 0.9 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.postButtonText,
            { color: isValid ? "#FFFFFF" : theme.textSecondary },
          ]}
        >
          Post Request
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
