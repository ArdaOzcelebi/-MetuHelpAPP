import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getQuestion,
  subscribeToAnswers,
  addAnswer,
  type QAQuestion,
  type QAAnswer,
} from "@/src/services/qaService";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
  Shadows,
} from "@/constants/theme";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type QuestionDetailScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "QuestionDetail">;
  route: RouteProp<BrowseStackParamList, "QuestionDetail">;
};

export default function QuestionDetailScreen({
  route,
  navigation,
}: QuestionDetailScreenProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { questionId } = route.params;

  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let unsubscribeAnswers: (() => void) | undefined;

    const loadData = async () => {
      try {
        const q = await getQuestion(questionId);
        if (!q) {
          setSuccessMessage("Error: Question not found");
          setTimeout(() => navigation.goBack(), 2000);
          return;
        }
        setQuestion(q);

        // Subscribe to answers
        unsubscribeAnswers = subscribeToAnswers(
          questionId,
          (updatedAnswers) => {
            setAnswers(updatedAnswers);
          },
        );

        setLoading(false);
      } catch (error) {
        console.error("Failed to load question:", error);
        setSuccessMessage("Error: Failed to load question");
        setTimeout(() => navigation.goBack(), 2000);
      }
    };

    loadData();

    return () => {
      if (unsubscribeAnswers) {
        unsubscribeAnswers();
      }
    };
  }, [questionId, navigation]);

  const handlePostAnswer = async () => {
    if (!answerText.trim() || isPosting) return;

    if (!user) {
      setSuccessMessage("Error: You must be logged in to post an answer");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    setIsPosting(true);
    Keyboard.dismiss();

    try {
      await addAnswer(
        questionId,
        answerText.trim(),
        user.uid,
        user.displayName || "Anonymous",
      );
      setAnswerText("");
      setSuccessMessage("Answer posted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error posting answer:", error);
      setSuccessMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Error: Failed to post answer",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsPosting(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: "#FAFAFA" }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METUColors.maroon} />
        </View>
      </View>
    );
  }

  if (!question) return null;

  return (
    <View style={[styles.container, { backgroundColor: "#FAFAFA" }]}>
      {/* Success/Error Message */}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
                  },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {question.authorName.substring(0, 1).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.authorInfo}>
                <ThemedText style={[styles.authorName, { color: "#1A1A1A" }]}>
                  {question.authorName}
                </ThemedText>
                <ThemedText style={[styles.timeText, { color: "#999999" }]}>
                  {getTimeAgo(question.createdAt)}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[styles.questionTitle, { color: "#1A1A1A" }]}>
              {question.title}
            </ThemedText>

            {question.body ? (
              <ThemedText style={[styles.questionBody, { color: "#333333" }]}>
                {question.body}
              </ThemedText>
            ) : null}
          </View>

          {/* Answers Section */}
          <View style={styles.answersSection}>
            <ThemedText style={[styles.answersHeader, { color: "#1A1A1A" }]}>
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </ThemedText>

            {answers.length === 0 ? (
              <View style={styles.noAnswers}>
                <Feather name="message-circle" size={48} color="#CCCCCC" />
                <ThemedText
                  style={[styles.noAnswersText, { color: "#666666" }]}
                >
                  No answers yet. Be the first to help!
                </ThemedText>
              </View>
            ) : (
              answers.map((answer) => (
                <View
                  key={answer.id}
                  style={[
                    styles.answerCard,
                    answer.authorId === user?.uid && styles.userAnswerCard,
                  ]}
                >
                  <View style={styles.answerHeader}>
                    <View
                      style={[
                        styles.avatarSmall,
                        {
                          backgroundColor: isDark
                            ? "#CC3333"
                            : METUColors.maroon,
                        },
                      ]}
                    >
                      <ThemedText style={styles.avatarTextSmall}>
                        {answer.authorName.substring(0, 1).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.answerAuthorInfo}>
                      <ThemedText
                        style={[styles.answerAuthorName, { color: "#1A1A1A" }]}
                      >
                        {answer.authorName}
                        {answer.authorId === user?.uid && (
                          <ThemedText style={styles.youBadge}>
                            {" "}
                            (You)
                          </ThemedText>
                        )}
                      </ThemedText>
                      <ThemedText
                        style={[styles.timeText, { color: "#999999" }]}
                      >
                        {getTimeAgo(answer.createdAt)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.answerBody, { color: "#333333" }]}>
                    {answer.body}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Answer Input - Floating Chat-style */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.answerInput}
            placeholder="Write your answer..."
            placeholderTextColor="#999999"
            value={answerText}
            onChangeText={setAnswerText}
            multiline
            editable={!isPosting}
          />
          <Pressable
            onPress={handlePostAnswer}
            disabled={!answerText.trim() || isPosting}
            style={({ pressed }) => [
              styles.sendButton,
              { opacity: pressed && answerText.trim() && !isPosting ? 0.9 : 1 },
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : answerText.trim() ? (
              <LinearGradient
                colors={
                  isDark
                    ? ["#CC3333", "#AA2222"]
                    : [METUColors.maroon, METUColors.maroonDark]
                }
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            ) : (
              <View style={styles.sendButtonDisabled}>
                <Feather name="send" size={20} color="#CCCCCC" />
              </View>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  questionCard: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  timeText: {
    fontSize: Typography.small.fontSize,
  },
  questionTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
  },
  questionBody: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
  },
  answersSection: {
    marginTop: Spacing.sm,
  },
  answersHeader: {
    fontSize: Typography.subtitle.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  noAnswers: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  noAnswersText: {
    fontSize: Typography.body.fontSize,
    marginTop: Spacing.md,
  },
  answerCard: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: 12,
    ...Shadows.small,
  },
  userAnswerCard: {
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  avatarTextSmall: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  answerAuthorInfo: {
    flex: 1,
  },
  answerAuthorName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  youBadge: {
    fontSize: Typography.small.fontSize,
    fontWeight: "400",
    color: METUColors.actionGreen,
  },
  answerBody: {
    fontSize: Typography.body.fontSize,
    lineHeight: 22,
  },
  inputContainer: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 60 : 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: Spacing.sm,
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  answerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: Typography.body.fontSize,
    color: "#1A1A1A",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
});
