import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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

type AskQuestionScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "AskQuestion">;
};

export default function AskQuestionScreen({
  navigation,
}: AskQuestionScreenProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isValid = title.trim().length > 0 && body.trim().length > 0;

  const handleCancel = () => {
    console.log("[AskQuestionScreen] Cancel button pressed");
    Keyboard.dismiss();
    navigation.goBack();
  };

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
      // Simple feedback without Alert.alert callbacks for web compatibility
      setSuccessMessage("You must be logged in to post a question");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    console.log("[AskQuestionScreen] Starting post submission...");
    setIsPosting(true);

    try {
      console.log("[AskQuestionScreen] Calling createQuestion...");
      const questionId = await createQuestion(
        title.trim(),
        body.trim(),
        user.uid,
        user.displayName || "Anonymous",
      );

      console.log(
        "[AskQuestionScreen] Question created successfully:",
        questionId,
      );

      // Dismiss keyboard immediately
      Keyboard.dismiss();

      // Show success message
      setSuccessMessage("Question posted successfully!");

      // Navigate back immediately
      console.log("[AskQuestionScreen] Navigating back");
      setTimeout(() => {
        navigation.goBack();
      }, 100);
    } catch (error) {
      console.error("[AskQuestionScreen] Error posting question:", error);
      console.error("[AskQuestionScreen] Error details:", {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
      });

      setSuccessMessage(
        error instanceof Error
          ? error.message
          : "Failed to post question. Please check your internet connection and try again.",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsPosting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#FAFAFA" }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: "#FFFFFF",
            borderBottomColor: "#E5E5E5",
          },
        ]}
      >
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          disabled={isPosting}
        >
          <ThemedText
            style={[
              styles.cancelText,
              { color: isDark ? "#FF6B6B" : METUColors.maroon },
            ]}
          >
            Cancel
          </ThemedText>
        </Pressable>

        <ThemedText style={[styles.headerTitle, { color: "#1A1A1A" }]}>
          New Question
        </ThemedText>

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
                  : "#E5E5E5",
              opacity: pressed && isValid && !isPosting ? 0.9 : 1,
            },
          ]}
        >
          {isPosting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText
              style={[
                styles.postButtonText,
                {
                  color: isValid && !isPosting ? "#FFFFFF" : "#999999",
                },
              ]}
            >
              Post
            </ThemedText>
          )}
        </Pressable>
      </View>

      {/* Success Message */}
      {successMessage ? (
        <View
          style={[
            styles.successMessage,
            {
              backgroundColor: successMessage.includes("Error")
                ? METUColors.alertRed
                : METUColors.actionGreen,
            },
          ]}
        >
          <ThemedText style={styles.successText}>{successMessage}</ThemedText>
        </View>
      ) : null}

      {/* Content */}
      <ScreenKeyboardAwareScrollView>
        <View style={styles.content}>
          {/* Title Input - Minimalist, document-style */}
          <TextInput
            style={[
              styles.titleInput,
              {
                color: "#1A1A1A",
              },
            ]}
            placeholder="Question title..."
            placeholderTextColor="#999999"
            value={title}
            onChangeText={setTitle}
            multiline
            editable={!isPosting}
            autoFocus
          />

          {/* Body Input - Standard multiline */}
          <TextInput
            style={[
              styles.bodyInput,
              {
                color: "#1A1A1A",
              },
            ]}
            placeholder="Provide more details to help others answer your question..."
            placeholderTextColor="#999999"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            editable={!isPosting}
          />
        </View>
      </ScreenKeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 70,
  },
  cancelText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "400",
  },
  headerTitle: {
    fontSize: Typography.subtitle.fontSize,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  postButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  successMessage: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  successText: {
    color: "#FFFFFF",
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
    textAlign: "center",
  },
  content: {
    padding: Spacing.lg,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    minHeight: 60,
    marginBottom: Spacing.lg,
    // No border, no background - looks like a document title
  },
  bodyInput: {
    fontSize: Typography.body.fontSize,
    minHeight: 200,
    lineHeight: 24,
    // No border, no background - minimalist style
  },
});
