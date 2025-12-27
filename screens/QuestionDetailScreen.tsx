import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
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
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { questionId } = route.params;

  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    let unsubscribeAnswers: (() => void) | undefined;

    const loadData = async () => {
      try {
        const q = await getQuestion(questionId);
        if (!q) {
          Alert.alert("Error", "Question not found");
          navigation.goBack();
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
        Alert.alert("Error", "Failed to load question");
        navigation.goBack();
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
      Alert.alert("Error", "You must be logged in to post an answer");
      return;
    }

    setIsPosting(true);

    try {
      await addAnswer(
        questionId,
        answerText.trim(),
        user.uid,
        user.displayName || "Anonymous",
      );
      setAnswerText("");
      Alert.alert("Success", "Your answer has been posted!");
    } catch (error) {
      console.error("Error posting answer:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to post answer",
      );
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
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METUColors.maroon} />
        </View>
      </ThemedView>
    );
  }

  if (!question) return null;

  return (
    <ThemedView style={styles.container}>
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
          <View
            style={[
              styles.questionCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
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
                <ThemedText style={styles.authorName}>
                  {question.authorName}
                </ThemedText>
                <ThemedText
                  style={[styles.timeText, { color: theme.textSecondary }]}
                >
                  {getTimeAgo(question.createdAt)}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.questionTitle}>
              {question.title}
            </ThemedText>

            {question.body ? (
              <ThemedText
                style={[styles.questionBody, { color: theme.textSecondary }]}
              >
                {question.body}
              </ThemedText>
            ) : null}
          </View>

          {/* Answers Section */}
          <View style={styles.answersSection}>
            <ThemedText style={styles.answersHeader}>
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </ThemedText>

            {answers.length === 0 ? (
              <View style={styles.noAnswers}>
                <Feather name="message-circle" size={48} color="#CCCCCC" />
                <ThemedText
                  style={[styles.noAnswersText, { color: theme.textSecondary }]}
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
                    { backgroundColor: theme.cardBackground },
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
                      <ThemedText style={styles.answerAuthorName}>
                        {answer.authorName}
                        {answer.authorId === user?.uid && (
                          <ThemedText style={styles.youBadge}>
                            {" "}
                            (You)
                          </ThemedText>
                        )}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.timeText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {getTimeAgo(answer.createdAt)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.answerBody}>
                    {answer.body}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Answer Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.cardBackground,
              borderTopColor: theme.backgroundSecondary,
            },
          ]}
        >
          <TextInput
            style={[
              styles.answerInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
              },
            ]}
            placeholder="Write your answer..."
            placeholderTextColor={theme.textSecondary}
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
              {
                backgroundColor:
                  answerText.trim() && !isPosting
                    ? isDark
                      ? "#CC3333"
                      : METUColors.maroon
                    : theme.backgroundSecondary,
                opacity: pressed && answerText.trim() && !isPosting ? 0.9 : 1,
              },
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={answerText.trim() ? "#FFFFFF" : theme.textSecondary}
              />
            )}
          </Pressable>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
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
    bottom: Platform.OS === "web" ? 60 : 0, // Add space for bottom navigation on web
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
    alignItems: "flex-end",
  },
  answerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.body.fontSize,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
