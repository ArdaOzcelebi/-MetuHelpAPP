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
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConfirmationModal } from "@/src/components/ConfirmationModal";
import {
  getQuestion,
  subscribeToAnswers,
  addAnswer,
  deleteQuestion,
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
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { questionId } = route.params;
  const insets = useSafeAreaInsets();

  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteQuestion = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setShowDeleteModal(false); // Close modal immediately to prevent double-clicks
    
    try {
      await deleteQuestion(questionId);
      // Navigate back immediately on success
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting question:", error);
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.failedToDeleteQuestion,
      );
      setIsDeleting(false); // Reset on error to allow retries
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
      <View style={[styles.container, { backgroundColor: "#000000" }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METUColors.maroon} />
        </View>
      </View>
    );
  }

  if (!question) return null;

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      {/* Custom Header with Back Button */}
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: insets.top,
            backgroundColor: isDark ? "#1E1E1E" : "#000000",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Question Details</ThemedText>
        <View style={styles.headerRight}>
          {question && user && question.authorId === user.uid && (
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={20} color={METUColors.alertRed} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Card */}
          <View style={[styles.questionCard, { backgroundColor: "#1E1E1E" }]}>
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
                <ThemedText style={[styles.authorName, { color: "#FFFFFF" }]}>
                  {question.authorName}
                </ThemedText>
                <ThemedText style={[styles.timeText, { color: "#9BA1A6" }]}>
                  {getTimeAgo(question.createdAt)}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[styles.questionTitle, { color: "#FFFFFF" }]}>
              {question.title}
            </ThemedText>

            {question.body ? (
              <ThemedText style={[styles.questionBody, { color: "#9BA1A6" }]}>
                {question.body}
              </ThemedText>
            ) : null}
          </View>

          {/* Answers Section */}
          <View style={styles.answersSection}>
            <ThemedText style={[styles.answersHeader, { color: "#FFFFFF" }]}>
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </ThemedText>

            {answers.length === 0 ? (
              <View style={styles.noAnswers}>
                <Feather name="message-circle" size={48} color="#CCCCCC" />
                <ThemedText
                  style={[styles.noAnswersText, { color: "#9BA1A6" }]}
                >
                  No answers yet. Be the first to help!
                </ThemedText>
              </View>
            ) : (
              answers.map((answer) => (
                <View
                  key={answer.id}
                  style={[styles.answerCard, { backgroundColor: "#1E1E1E" }]}
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
                        style={[styles.answerAuthorName, { color: "#FFFFFF" }]}
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
                        style={[styles.timeText, { color: "#9BA1A6" }]}
                      >
                        {getTimeAgo(answer.createdAt)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.answerBody, { color: "#FFFFFF" }]}>
                    {answer.body}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Answer Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.answerInput,
              {
                backgroundColor: "#2A2A2A",
                color: "#FFFFFF",
              },
            ]}
            placeholder="Write your answer..."
            placeholderTextColor="#9BA1A6"
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
                  answerText.trim() && !isPosting ? "#CC3333" : "#333333",
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
                color={answerText.trim() ? "#FFFFFF" : "#9BA1A6"}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title={t.deleteQuestionConfirm}
        message={t.deleteQuestionConfirmMessage}
        confirmText={t.delete}
        cancelText={t.cancel}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setShowDeleteModal(false)}
        confirmColor={METUColors.alertRed}
        icon="trash-2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: Typography.subtitle.fontSize,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    flexGrow: 1,
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
    flexDirection: "row",
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
    alignItems: "flex-end",
    backgroundColor: "#1E1E1E",
    borderTopColor: "#333333",
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
