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
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createRequest,
  LOCATION_OPTIONS,
  type LocationId,
  type RequestCategory,
} from "@/services/requestsStore";
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
  { id: "medical", translationKey: "medical", icon: "activity" },
  { id: "academic", translationKey: "academic", icon: "book" },
  { id: "transport", translationKey: "transport", icon: "navigation" },
  { id: "other", translationKey: "other", icon: "help-circle" },
] as const;

export default function PostNeedScreen({ navigation }: PostNeedScreenProps) {
  const { theme, isDark } = useTheme();
  const { language, t } = useLanguage();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<RequestCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationId | null>(
    null
  );
  const [details, setDetails] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const trimmedTitle = title.trim();
  const isValid =
    trimmedTitle.length > 0 && selectedCategory !== null && selectedLocation !== null;

  const handlePost = () => {
    if (!isValid || !selectedCategory || !selectedLocation) {
      return;
    }

    try {
      createRequest({
        title: trimmedTitle,
        category: selectedCategory,
        locationId: selectedLocation,
        details,
        urgent: isUrgent,
        language,
      });

      Alert.alert(
        language === "en" ? "Request Posted!" : "Istek paylasildi!",
        language === "en"
          ? "Your request has been posted. Fellow students will be notified."
          : "Ihtiyacin paylasildi. Diger ogrenciler bilgilendirilecek.",
        [
          {
            text: language === "en" ? "OK" : "Tamam",
            onPress: () => navigation.goBack(),
          },
        ]
      );

      setTitle("");
      setSelectedCategory(null);
      setSelectedLocation(null);
      setDetails("");
      setIsUrgent(false);
    } catch (error) {
      Alert.alert(
        language === "en" ? "Something went wrong" : "Bir sorun olustu",
        language === "en"
          ? "Please try again in a few seconds."
          : "Lutfen birkaç saniye sonra tekrar dene.",
        [{ text: language === "en" ? "OK" : "Tamam" }]
      );
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionLabel}>
        {language === "en" ? "What do you need?" : "Neye ihtiyacin var?"}
      </ThemedText>
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

      <ThemedText style={styles.sectionLabel}>
        {language === "en" ? "Category" : "Kategori"}
      </ThemedText>
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
              {t[cat.translationKey]}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>
        {language === "en" ? "Location" : "Konum"}
      </ThemedText>
      <View style={styles.locationsGrid}>
        {LOCATION_OPTIONS.map((loc) => (
          <Pressable
            key={loc.id}
            onPress={() => setSelectedLocation(loc.id)}
            style={[
              styles.locationChip,
              {
                backgroundColor:
                  selectedLocation === loc.id
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
                    selectedLocation === loc.id ? "#FFFFFF" : theme.text,
                },
              ]}
            >
              {language === "en" ? loc.labelEn : loc.labelTr}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.sectionLabel}>
        {language === "en"
          ? "Additional Details (Optional)"
          : "Ek Bilgiler (Opsiyonel)"}
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
              {language === "en" ? "Mark as Urgent" : "Acil olarak isaretle"}
            </ThemedText>
            <ThemedText
              style={[styles.urgentHint, { color: theme.textSecondary }]}
            >
              {language === "en"
                ? "Use only for time-sensitive requests"
                : "Sadece zaman hassas ihtiyaçlar icin kullan"}
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
          {language === "en" ? "Post Request" : "Istek Paylas"}
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
