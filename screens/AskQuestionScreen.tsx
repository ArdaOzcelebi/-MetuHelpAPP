import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import { createQuestion } from "@/src/services/qaService";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";
import type { MainTabParamList } from "@/navigation/MainTabNavigator";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type AskQuestionScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "AskQuestion">;
};

export default function AskQuestionScreen({
  navigation,
}: AskQuestionScreenProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Use composite navigation to navigate across stacks
  const rootNavigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<MainTabParamList>,
        NativeStackNavigationProp<HomeStackParamList>
      >
    >();

  const isValid = title.trim().length >= 10;

  const handlePost = async () => {
    console.log("[AskQuestionScreen] handlePost called", {
      isValid,
      isPosting,
      hasUser: !!user,
    });

    if (!isValid || isPosting) {
      console.log("[AskQuestionScreen] Validation failed or already posting");
      return;
    }

    if (!user) {
      console.log("[AskQuestionScreen] No user found");
      Alert.alert("Error", "You must be logged in to post a question");
      return;
    }

    console.log("[AskQuestionScreen] Starting post submission...");
    setIsPosting(true);

    try {
      console.log("[AskQuestionScreen] Calling createQuestion...");
      const questionId = await createQuestion(
        title.trim(),
        details.trim(),
        user.uid,
        user.displayName || "Anonymous",
      );

      console.log(
        "[AskQuestionScreen] Question created successfully:",
        questionId,
      );

      // Clear form state
      setTitle("");
      setDetails("");

      // Dismiss keyboard
      Keyboard.dismiss();

      // Reset posting state
      setIsPosting(false);

      // Navigate to Home tab > OfferHelp screen with "recent" tab selected
      console.log(
        "[AskQuestionScreen] Navigating to HomeTab > OfferHelp with recent tab",
      );
      rootNavigation.navigate("HomeTab", {
        screen: "OfferHelp",
        params: { initialTab: "recent" },
      });
    } catch (error) {
      console.error("[AskQuestionScreen] Error posting question:", error);
      console.error("[AskQuestionScreen] Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to post question. Please check your internet connection and try again.",
      );
      setIsPosting(false);
    }
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
        editable={!isPosting}
      />
      <ThemedText
        style={[
          styles.helperText,
          {
            color:
              title.trim().length >= 10
                ? METUColors.actionGreen
                : theme.textSecondary,
          },
        ]}
      >
        {title.trim().length >= 10
          ? "✓ Great question!"
          : `Minimum 10 characters (${title.trim().length}/10)`}
      </ThemedText>

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
        placeholder="Provide more context to help others answer your question..."
        placeholderTextColor={theme.textSecondary}
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        editable={!isPosting}
      />

      <Pressable
        onPress={handlePost}
        disabled={!isValid || isPosting}
        style={({ pressed }) => [
          styles.postButton,
          {
            backgroundColor:
              isValid && !isPosting
                ? isDark
                  ? "#CC3333"
                  : METUColors.maroon
                : theme.backgroundDefault,
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
            Post Question
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
