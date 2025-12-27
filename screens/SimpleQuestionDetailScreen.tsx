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
  voteOnItem,
  getUserVote,
  markAnswerAsAccepted,
} from "@/src/services/questionService";
import type { Question, Answer, VoteType } from "@/src/types/question";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type SimpleQuestionDetailScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "QuestionDetail">;
  route: RouteProp<BrowseStackParamList, "QuestionDetail">;
};

export default function SimpleQuestionDetailScreen({
  route,
  navigation,
}: SimpleQuestionDetailScreenProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { questionId } = route.params;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [questionVote, setQuestionVote] = useState<VoteType>(null);
  const [answerVotes, setAnswerVotes] = useState<Map<string, VoteType>>(
    new Map(),
  );

  // Load question and answers
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

        // Load user's vote on question
        if (user) {
          const vote = await getUserVote(q.id, user.uid);
          setQuestionVote(vote);
        }

        // Subscribe to answers
        unsubscribeAnswers = subscribeToAnswers(questionId, async (updatedAnswers) => {
          setAnswers(updatedAnswers);

          // Load votes for all answers
          if (user) {
            const votes = new Map<string, VoteType>();
            for (const answer of updatedAnswers) {
              const vote = await getUserVote(answer.id, user.uid);
              votes.set(answer.id, vote);
            }
            setAnswerVotes(votes);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to load question:", error);
        Alert.alert("Error", "Failed to load question");
        navigation.goBack();
      }
    };

    loadData();

    return () => {
      if (unsubscribeAnswers) unsubscribeAnswers();
    };
  }, [questionId, user, navigation]);

  // Handle voting on question
  const handleVoteQuestion = async (voteType: VoteType) => {
    if (!user || !question) return;

    const currentVote = questionVote;
    const newVote = currentVote === voteType ? null : voteType;

    // Optimistic update
    setQuestionVote(newVote);
    const voteDelta =
      newVote === "upvote" ? 1 : newVote === "downvote" ? -1 : 0;
    const currentDelta =
      currentVote === "upvote" ? -1 : currentVote === "downvote" ? 1 : 0;
    setQuestion({ ...question, votes: question.votes + voteDelta + currentDelta });

    try {
      await voteOnItem(question.id, "question", newVote, user.uid);
    } catch (error) {
      // Revert on error
      setQuestionVote(currentVote);
      setQuestion({ ...question, votes: question.votes });
      Alert.alert("Error", "Failed to record vote");
    }
  };

  // Handle voting on answer
  const handleVoteAnswer = async (answerId: string, voteType: VoteType) => {
    if (!user) return;

    const currentVote = answerVotes.get(answerId) || null;
    const newVote = currentVote === voteType ? null : voteType;

    // Optimistic update
    const newVotes = new Map(answerVotes);
    newVotes.set(answerId, newVote);
    setAnswerVotes(newVotes);

    const voteDelta =
      newVote === "upvote" ? 1 : newVote === "downvote" ? -1 : 0;
    const currentDelta =
      currentVote === "upvote" ? -1 : currentVote === "downvote" ? 1 : 0;

    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? { ...a, votes: a.votes + voteDelta + currentDelta }
          : a,
      ),
    );

    try {
      await voteOnItem(answerId, "answer", newVote, user.uid, questionId);
    } catch (error) {
      // Revert on error
      newVotes.set(answerId, currentVote);
      setAnswerVotes(newVotes);
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answerId
            ? { ...a, votes: a.votes - voteDelta - currentDelta }
            : a,
        ),
      );
      Alert.alert("Error", "Failed to record vote");
    }
  };

  // Handle posting answer
  const handlePostAnswer = async () => {
    if (!user || !answerText.trim()) return;

    setIsPosting(true);

    try {
      await addAnswer(
        questionId,
        { body: answerText.trim() },
        user.uid,
        user.email || "",
        user.displayName || "Anonymous User",
      );
      setAnswerText("");
      Alert.alert("Success", "Your answer has been posted!");
    } catch (error) {
      console.error("Failed to post answer:", error);
      Alert.alert("Error", "Failed to post answer. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Handle accepting answer
  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question) return;

    if (question.author.uid !== user.uid) {
      Alert.alert("Error", "Only the question author can accept answers");
      return;
    }

    try {
      await markAnswerAsAccepted(questionId, answerId, user.uid);
      Alert.alert("Success", "Answer accepted!");
    } catch (error) {
      console.error("Failed to accept answer:", error);
      Alert.alert("Error", "Failed to accept answer");
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading question...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!question) return null;

  const isQuestionAuthor = user?.uid === question.author.uid;

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
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {question.author.name.substring(0, 1).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.authorInfo}>
                <ThemedText style={styles.authorName}>
                  {question.author.name}
                </ThemedText>
                <ThemedText
                  style={[styles.timeText, { color: theme.textSecondary }]}
                >
                  {new Date(question.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>

            {/* Question Title */}
            <ThemedText style={styles.questionTitle}>
              {question.title}
            </ThemedText>

            {/* Question Body */}
            {question.body ? (
              <ThemedText
                style={[styles.questionBody, { color: theme.textSecondary }]}
              >
                {question.body}
              </ThemedText>
            ) : null}

            {/* Question Vote Controls */}
            <View style={styles.voteControls}>
              <Pressable
                onPress={() => handleVoteQuestion("upvote")}
                style={[
                  styles.voteButton,
                  questionVote === "upvote" && styles.voteButtonActive,
                ]}
              >
                <Feather
                  name="arrow-up"
                  size={24}
                  color={
                    questionVote === "upvote"
                      ? METUColors.actionGreen
                      : theme.textSecondary
                  }
                />
              </Pressable>
              <ThemedText
                style={[
                  styles.voteCount,
                  {
                    color:
                      question.votes > 0
                        ? METUColors.actionGreen
                        : question.votes < 0
                          ? METUColors.alertRed
                          : theme.textSecondary,
                  },
                ]}
              >
                {question.votes}
              </ThemedText>
              <Pressable
                onPress={() => handleVoteQuestion("downvote")}
                style={[
                  styles.voteButton,
                  questionVote === "downvote" && styles.voteButtonActive,
                ]}
              >
                <Feather
                  name="arrow-down"
                  size={24}
                  color={
                    questionVote === "downvote"
                      ? METUColors.alertRed
                      : theme.textSecondary
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* Answers Section */}
          <View style={styles.answersSection}>
            <ThemedText style={styles.answersHeader}>
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </ThemedText>

            {answers.length === 0 ? (
              <View style={styles.noAnswers}>
                <Feather
                  name="message-circle"
                  size={48}
                  color={theme.textSecondary}
                />
                <ThemedText
                  style={[styles.noAnswersText, { color: theme.textSecondary }]}
                >
                  No answers yet. Be the first to help!
                </ThemedText>
              </View>
            ) : (
              answers.map((answer) => {
                const userVote = answerVotes.get(answer.id) || null;
                const isAnswerAuthor = user?.uid === answer.author.uid;

                return (
                  <View
                    key={answer.id}
                    style={[
                      styles.answerCard,
                      {
                        backgroundColor: answer.accepted
                          ? isDark
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(16, 185, 129, 0.05)"
                          : theme.backgroundDefault,
                        borderColor: answer.accepted
                          ? METUColors.actionGreen
                          : "transparent",
                        borderWidth: answer.accepted ? 2 : 0,
                      },
                    ]}
                  >
                    {answer.accepted ? (
                      <View style={styles.acceptedBadge}>
                        <Feather
                          name="check-circle"
                          size={16}
                          color={METUColors.actionGreen}
                        />
                        <ThemedText
                          style={[
                            styles.acceptedText,
                            { color: METUColors.actionGreen },
                          ]}
                        >
                          Accepted Answer
                        </ThemedText>
                      </View>
                    ) : null}

                    {/* Answer Header */}
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
                          {answer.author.name.substring(0, 1).toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={styles.answerAuthorInfo}>
                        <ThemedText style={styles.answerAuthorName}>
                          {answer.author.name}
                          {isAnswerAuthor ? " (You)" : ""}
                        </ThemedText>
                        <ThemedText
                          style={[styles.timeText, { color: theme.textSecondary }]}
                        >
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Answer Body */}
                    <ThemedText style={styles.answerBody}>
                      {answer.body}
                    </ThemedText>

                    {/* Answer Actions */}
                    <View style={styles.answerActions}>
                      {/* Vote Controls */}
                      <View style={styles.answerVoteControls}>
                        <Pressable
                          onPress={() => handleVoteAnswer(answer.id, "upvote")}
                          style={styles.voteButtonSmall}
                        >
                          <Feather
                            name="arrow-up"
                            size={18}
                            color={
                              userVote === "upvote"
                                ? METUColors.actionGreen
                                : theme.textSecondary
                            }
                          />
                        </Pressable>
                        <ThemedText
                          style={[
                            styles.voteCountSmall,
                            {
                              color:
                                answer.votes > 0
                                  ? METUColors.actionGreen
                                  : answer.votes < 0
                                    ? METUColors.alertRed
                                    : theme.textSecondary,
                            },
                          ]}
                        >
                          {answer.votes}
                        </ThemedText>
                        <Pressable
                          onPress={() =>
                            handleVoteAnswer(answer.id, "downvote")
                          }
                          style={styles.voteButtonSmall}
                        >
                          <Feather
                            name="arrow-down"
                            size={18}
                            color={
                              userVote === "downvote"
                                ? METUColors.alertRed
                                : theme.textSecondary
                            }
                          />
                        </Pressable>
                      </View>

                      {/* Accept Button */}
                      {!answer.accepted && isQuestionAuthor ? (
                        <Pressable
                          onPress={() => handleAcceptAnswer(answer.id)}
                          style={[
                            styles.acceptButton,
                            { borderColor: METUColors.actionGreen },
                          ]}
                        >
                          <Feather
                            name="check"
                            size={14}
                            color={METUColors.actionGreen}
                          />
                          <ThemedText
                            style={[
                              styles.acceptButtonText,
                              { color: METUColors.actionGreen },
                            ]}
                          >
                            Accept
                          </ThemedText>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Answer Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.backgroundRoot,
              borderTopColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.answerInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
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
                opacity: pressed ? 0.8 : 1,
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
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginRight: Spacing.md,
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
    fontSize: Typography.caption.fontSize,
  },
  questionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  questionBody: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  voteControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  voteButton: {
    padding: Spacing.sm,
  },
  voteButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: BorderRadius.sm,
  },
  voteCount: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  answersSection: {
    marginTop: Spacing.md,
  },
  answersHeader: {
    fontSize: Typography.h4.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  noAnswers: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.md,
  },
  noAnswersText: {
    fontSize: Typography.body.fontSize,
    textAlign: "center",
  },
  answerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  acceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  acceptedText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
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
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  answerBody: {
    fontSize: Typography.body.fontSize,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  answerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerVoteControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  voteButtonSmall: {
    padding: 4,
  },
  voteCountSmall: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  acceptButtonText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
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
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
