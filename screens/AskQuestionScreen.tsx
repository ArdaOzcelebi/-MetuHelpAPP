import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert } from "react-native";
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
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type AskQuestionScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "AskQuestion">;
};

const CATEGORIES = [
  { id: "classes", label: "Classes", icon: "book" },
  { id: "professors", label: "Professors", icon: "user" },
  { id: "campus-life", label: "Campus Life", icon: "home" },
] as const;

export default function AskQuestionScreen({
  navigation,
}: AskQuestionScreenProps) {
  const { theme, isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  const isValid = title.length >= 10 && selectedCategory;

  const handlePost = () => {
    if (!isValid) return;

    Alert.alert(
      "Question Posted!",
      "Your question has been posted. Fellow students will be able to respond.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionLabel}>Your Question</ThemedText>
      <TextInput
        style={[
          styles.titleInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder="e.g., Best study spots on campus?"
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={setTitle}
        multiline
      />
      <ThemedText
        style={[
          styles.helperText,
          {
            color:
              title.length >= 10 ? METUColors.actionGreen : theme.textSecondary,
          },
        ]}
      >
        {title.length >= 10
          ? "Great question!"
          : `Minimum 10 characters (${title.length}/10)`}
      </ThemedText>

      <ThemedText style={styles.sectionLabel}>Category</ThemedText>
      <View style={styles.categoriesRow}>
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
                flex: 1,
              },
            ]}
          >
            <Feather
              name={cat.icon as keyof typeof Feather.glyphMap}
              size={20}
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
        placeholder="Provide more context to help others understand your question..."
        placeholderTextColor={theme.textSecondary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View
        style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.tipsHeader}>
          <Feather
            name="info"
            size={18}
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText style={styles.tipsTitle}>
            Tips for good questions
          </ThemedText>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              Be specific and clear
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              Choose the right category
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              Check if someone already asked
            </ThemedText>
          </View>
        </View>
      </View>

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
          Post Question
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
    minHeight: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  helperText: {
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  categoryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  categoryLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: "500",
  },
  detailsInput: {
    minHeight: 120,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  tipsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing["2xl"],
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.small.fontSize,
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
