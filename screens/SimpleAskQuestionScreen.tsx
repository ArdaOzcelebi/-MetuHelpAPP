import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
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

type SimpleAskQuestionScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "AskQuestion">;
};

export default function SimpleAskQuestionScreen({
  navigation,
}: SimpleAskQuestionScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const isValid = title.trim().length >= 10;

  const handlePost = async () => {
    if (!isValid) {
      Alert.alert("Invalid Question", "Title must be at least 10 characters");
      return;
    }

    if (!user) {
      Alert.alert("Not Logged In", "Please log in to ask a question");
      return;
    }

    setIsPosting(true);

    try {
      const questionId = await createQuestion(
        {
          title: title.trim(),
          body: body.trim(),
          tags: ["general"],
        },
        user.uid,
        user.email || "",
        user.displayName || "Anonymous User",
      );

      Alert.alert(
        "Success!",
        "Your question has been posted successfully",
        [
          {
            text: "View Question",
            onPress: () => {
              navigation.goBack();
              navigation.navigate("QuestionDetail", { questionId });
            },
          },
          {
            text: "Ask Another",
            onPress: () => {
              setTitle("");
              setBody("");
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to post question:", error);
      Alert.alert(
        "Error",
        "Failed to post your question. Please try again.",
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Question Title *</ThemedText>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: isValid
                    ? METUColors.actionGreen
                    : theme.textSecondary,
                },
              ]}
              placeholder="What's your question?"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              editable={!isPosting}
              autoFocus
            />
            <ThemedText
              style={[
                styles.hint,
                {
                  color: isValid
                    ? METUColors.actionGreen
                    : theme.textSecondary,
                },
              ]}
            >
              {title.length >= 10
                ? `✓ Good title (${title.length} characters)`
                : `${title.length}/10 characters minimum`}
            </ThemedText>
          </View>

          {/* Body Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Details (Optional)</ThemedText>
            <TextInput
              style={[
                styles.bodyInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                },
              ]}
              placeholder="Add more details to help others understand your question..."
              placeholderTextColor={theme.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isPosting}
            />
          </View>

          {/* Tips */}
          <View
            style={[
              styles.tipsCard,
              { backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5" },
            ]}
          >
            <View style={styles.tipsHeader}>
              <Feather
                name="help-circle"
                size={20}
                color={isDark ? "#FF6B6B" : METUColors.maroon}
              />
              <ThemedText style={styles.tipsTitle}>
                Tips for asking good questions
              </ThemedText>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Feather name="check" size={16} color={METUColors.actionGreen} />
                <ThemedText
                  style={[styles.tipText, { color: theme.textSecondary }]}
                >
                  Be clear and specific
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check" size={16} color={METUColors.actionGreen} />
                <ThemedText
                  style={[styles.tipText, { color: theme.textSecondary }]}
                >
                  Provide context and details
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check" size={16} color={METUColors.actionGreen} />
                <ThemedText
                  style={[styles.tipText, { color: theme.textSecondary }]}
                >
                  Check if it's already been asked
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Post Button */}
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
                    : theme.backgroundSecondary,
                opacity: pressed && isValid && !isPosting ? 0.9 : 1,
              },
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="send" size={20} color="#FFFFFF" />
                <ThemedText
                  style={[
                    styles.postButtonText,
                    {
                      color:
                        isValid && !isPosting ? "#FFFFFF" : theme.textSecondary,
                    },
                  ]}
                >
                  Post Question
                </ThemedText>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  titleInput: {
    fontSize: Typography.body.fontSize,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    minHeight: 52,
  },
  bodyInput: {
    fontSize: Typography.body.fontSize,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 140,
  },
  hint: {
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
  },
  tipsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
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
    flex: 1,
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 54,
    borderRadius: BorderRadius.lg,
  },
  postButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
});
