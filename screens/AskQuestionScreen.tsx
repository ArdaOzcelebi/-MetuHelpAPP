import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { createQuestion } from "@/src/services/questionService";
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
  { id: "classes", labelEn: "Classes", labelTr: "Dersler", icon: "book" },
  {
    id: "professors",
    labelEn: "Professors",
    labelTr: "Hocalar",
    icon: "user",
  },
  {
    id: "campus-life",
    labelEn: "Campus Life",
    labelTr: "Kampüs Yaşamı",
    icon: "home",
  },
] as const;

export default function AskQuestionScreen({
  navigation,
}: AskQuestionScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const isValid = title.length >= 10 && selectedCategory;

  const handlePost = async () => {
    if (!isValid || !user) {
      Alert.alert(t.error, t.mustBeLoggedIn);
      return;
    }

    setIsPosting(true);

    try {
      // Parse tags from comma-separated input
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Add the selected category as a tag
      if (selectedCategory) {
        tags.unshift(selectedCategory);
      }

      const questionId = await createQuestion(
        {
          title,
          body: details,
          tags,
        },
        user.uid,
        user.email || "",
        user.displayName || "Anonymous",
      );

      Alert.alert(t.questionPosted, t.questionPostedMessage, [
        {
          text: t.ok,
          onPress: () => {
            navigation.goBack();
            // Navigate to the question detail
            navigation.navigate("QuestionDetail", { questionId });
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to post question:", error);
      Alert.alert(
        t.failedToPostQuestion,
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionLabel}>{t.yourQuestion}</ThemedText>
      <TextInput
        style={[
          styles.titleInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder={t.questionTitlePlaceholder}
        placeholderTextColor={theme.textSecondary}
        value={title}
        onChangeText={setTitle}
        multiline
        editable={!isPosting}
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

      <ThemedText style={styles.sectionLabel}>{t.category}</ThemedText>
      <View style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => {
          const label = language === "en" ? cat.labelEn : cat.labelTr;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              disabled={isPosting}
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
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText style={styles.sectionLabel}>{t.questionBody}</ThemedText>
      <TextInput
        style={[
          styles.detailsInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder={t.questionBodyPlaceholder}
        placeholderTextColor={theme.textSecondary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!isPosting}
      />

      <ThemedText style={styles.sectionLabel}>{t.addTags}</ThemedText>
      <TextInput
        style={[
          styles.titleInput,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
          },
        ]}
        placeholder="housing, study-materials, transportation"
        placeholderTextColor={theme.textSecondary}
        value={tagsInput}
        onChangeText={setTagsInput}
        editable={!isPosting}
      />
      <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}>
        {t.tagsOptional}
      </ThemedText>

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
            {t.tipsForGoodQuestions}
          </ThemedText>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              {t.beSpecific}
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              {t.chooseRightCategory}
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="check" size={14} color={METUColors.actionGreen} />
            <ThemedText
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              {t.checkIfAskedBefore}
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handlePost}
        disabled={!isValid || isPosting}
        style={({ pressed }) => [
          styles.postButton,
          {
            backgroundColor:
              isValid && !isPosting
                ? METUColors.actionGreen
                : theme.backgroundSecondary,
            opacity: pressed && isValid && !isPosting ? 0.9 : 1,
          },
        ]}
      >
        {isPosting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText
            style={[
              styles.postButtonText,
              {
                color: isValid && !isPosting ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            {t.postQuestion}
          </ThemedText>
        )}
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
