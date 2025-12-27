import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getQuestion,
  subscribeToAnswers,
  addAnswer,
  markAnswerAsAccepted,
  voteOnItem,
  getUserVotes,
} from "@/src/services/questionService";
import type { Question, Answer, VoteType } from "@/src/types/question";
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
  navigation,
  route,
}: QuestionDetailScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { questionId } = route.params;

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [votes, setVotes] = useState<Map<string, VoteType>>(new Map());
  const [votingItem, setVotingItem] = useState<string | null>(null);

  // Load question and subscribe to answers
  useEffect(() => {
    let unsubscribeAnswers: (() => void) | undefined;

    const loadQuestion = async () => {
      try {
        setLoading(true);
        const q = await getQuestion(questionId);
        if (q) {
          setQuestion(q);

          // Subscribe to answers
          unsubscribeAnswers = subscribeToAnswers(
            questionId,
            (updatedAnswers) => {
              setAnswers(updatedAnswers);

              // Load user votes when answers are loaded
              if (user) {
                const itemIds = [q.id, ...updatedAnswers.map((a) => a.id)];
                getUserVotes(itemIds, user.uid).then((userVotes) => {
                  setVotes(userVotes);
                });
              }
            },
          );
        } else {
          Alert.alert(t.error, "Question not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Failed to load question:", error);
        Alert.alert(t.error, "Failed to load question");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();

    return () => {
      if (unsubscribeAnswers) {
        unsubscribeAnswers();
      }
    };
  }, [questionId, user, navigation, t]);

  // Update votes when answers change
  useEffect(() => {
    if (user && answers.length > 0) {
      const loadVotes = async () => {
        const itemIds = answers.map((a) => a.id);
        if (question) {
          itemIds.unshift(question.id);
        }
        const userVotes = await getUserVotes(itemIds, user.uid);
        setVotes(userVotes);
      };
      loadVotes();
    }
  }, [answers, question, user]);

  const handleVote = async (
    itemId: string,
    itemType: "question" | "answer",
    newVoteType: VoteType,
  ) => {
    if (!user) {
      Alert.alert(t.error, t.mustBeLoggedIn);
      return;
    }

    setVotingItem(itemId);

    try {
      const currentVote = votes.get(itemId);

      // If clicking the same vote type, remove vote
      const finalVoteType = currentVote === newVoteType ? null : newVoteType;

      await voteOnItem(
        itemId,
        itemType,
        finalVoteType,
        user.uid,
        itemType === "answer" ? questionId : undefined,
      );

      // Update local vote state
      setVotes((prev) => {
        const newVotes = new Map(prev);
        newVotes.set(itemId, finalVoteType);
        return newVotes;
      });

      // Update local question/answer vote count
      if (itemType === "question" && question) {
        const delta =
          finalVoteType === "upvote"
            ? 1
            : finalVoteType === "downvote"
              ? -1
              : currentVote === "upvote"
                ? -1
                : 1;
        setQuestion({ ...question, votes: question.votes + delta });
      } else if (itemType === "answer") {
        setAnswers((prev) =>
          prev.map((a) => {
            if (a.id === itemId) {
              const delta =
                finalVoteType === "upvote"
                  ? 1
                  : finalVoteType === "downvote"
                    ? -1
                    : currentVote === "upvote"
                      ? -1
                      : 1;
              return { ...a, votes: a.votes + delta };
            }
            return a;
          }),
        );
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      Alert.alert(t.failedToVote, error instanceof Error ? error.message : "");
    } finally {
      setVotingItem(null);
    }
  };

  const handleSubmitResponse = async () => {
    if (!user) {
      Alert.alert(t.error, t.mustBeLoggedIn);
      return;
    }

    if (newResponse.trim().length === 0) return;

    setIsPosting(true);

    try {
      await addAnswer(
        questionId,
        { body: newResponse },
        user.uid,
        user.email || "",
        user.displayName || "Anonymous",
      );
      setNewResponse("");
      Alert.alert(t.answerPosted, "");
    } catch (error) {
      console.error("Failed to post answer:", error);
      Alert.alert(
        t.failedToPostAnswer,
        error instanceof Error ? error.message : "",
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question) return;

    if (question.author.uid !== user.uid) {
      Alert.alert(t.error, "Only the question owner can accept answers");
      return;
    }

    try {
      await markAnswerAsAccepted(questionId, answerId, user.uid);
      Alert.alert(t.answerAccepted, "");
    } catch (error) {
      console.error("Failed to accept answer:", error);
      Alert.alert(t.error, error instanceof Error ? error.message : "");
    }
  };

  const getCategoryColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (
      tagLower.includes("class") ||
      tagLower.includes("ders") ||
      tagLower.includes("course")
    ) {
      return isDark ? "#60A5FA" : "#3B82F6";
    }
    if (
      tagLower.includes("professor") ||
      tagLower.includes("hoca") ||
      tagLower.includes("teacher")
    ) {
      return isDark ? "#A78BFA" : "#8B5CF6";
    }
    if (
      tagLower.includes("campus") ||
      tagLower.includes("kampus") ||
      tagLower.includes("life")
    ) {
      return isDark ? "#34D399" : "#10B981";
    }
    return theme.textSecondary;
  };

  const renderAnswer = ({ item }: { item: Answer }) => {
    const isAuthor = user?.uid === item.author.uid;
    const canAccept = user?.uid === question?.author.uid;
    const userVote = votes.get(item.id);

    return (
      <View
        style={[
          styles.responseCard,
          {
            backgroundColor: item.accepted
              ? isDark
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(16, 185, 129, 0.05)"
              : theme.backgroundDefault,
            borderColor: item.accepted ? METUColors.actionGreen : "transparent",
            borderWidth: item.accepted ? 2 : 0,
          },
        ]}
      >
        {item.accepted ? (
          <View style={styles.acceptedBadge}>
            <Feather
              name="check-circle"
              size={16}
              color={METUColors.actionGreen}
            />
            <ThemedText
              style={[styles.acceptedText, { color: METUColors.actionGreen }]}
            >
              {t.acceptedAnswer}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.responseHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {item.author.name.substring(0, 2).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.responseAuthorInfo}>
            <ThemedText style={styles.authorName}>
              {item.author.name}
              {isAuthor ? " (You)" : ""}
            </ThemedText>
            <ThemedText
              style={[styles.responseTime, { color: theme.textSecondary }]}
            >
              {new Date(item.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>

          {/* Voting Controls */}
          <View style={styles.voteContainer}>
            <Pressable
              onPress={() => handleVote(item.id, "answer", "upvote")}
              disabled={votingItem === item.id}
              style={styles.voteButton}
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
                styles.voteCount,
                {
                  color:
                    item.votes > 0
                      ? METUColors.actionGreen
                      : item.votes < 0
                        ? METUColors.alertRed
                        : theme.textSecondary,
                },
              ]}
            >
              {item.votes}
            </ThemedText>
            <Pressable
              onPress={() => handleVote(item.id, "answer", "downvote")}
              disabled={votingItem === item.id}
              style={styles.voteButton}
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
        </View>

        <ThemedText style={styles.responseContent}>{item.body}</ThemedText>

        {!item.accepted && canAccept ? (
          <Pressable
            onPress={() => handleAcceptAnswer(item.id)}
            style={[
              styles.acceptButton,
              { borderColor: METUColors.actionGreen },
            ]}
          >
            <Feather name="check" size={16} color={METUColors.actionGreen} />
            <ThemedText
              style={[
                styles.acceptButtonText,
                { color: METUColors.actionGreen },
              ]}
            >
              {t.acceptAnswer}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const ListHeader = () => {
    if (!question) return null;

    const categoryTag = question.tags[0] || "";
    const userVote = votes.get(question.id);

    return (
      <View style={styles.questionSection}>
        <View style={styles.questionHeader}>
          <View style={styles.posterInfo}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
              ]}
            >
              <ThemedText style={styles.avatarText}>
                {question.author.name.substring(0, 2).toUpperCase()}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.posterName}>
                {question.author.name}
              </ThemedText>
              <ThemedText
                style={[styles.postTime, { color: theme.textSecondary }]}
              >
                {new Date(question.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
          {categoryTag ? (
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: `${getCategoryColor(categoryTag)}20` },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryTagText,
                  { color: getCategoryColor(categoryTag) },
                ]}
              >
                {categoryTag}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText type="h3" style={styles.questionTitle}>
          {question.title}
        </ThemedText>

        {question.body ? (
          <ThemedText style={styles.questionContent}>
            {question.body}
          </ThemedText>
        ) : null}

        {/* Tags */}
        {question.tags.length > 1 ? (
          <View style={styles.tagsContainer}>
            {question.tags.slice(1).map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <ThemedText
                  style={[styles.tagText, { color: theme.textSecondary }]}
                >
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {/* Question Voting */}
        <View style={styles.questionVoteContainer}>
          <Pressable
            onPress={() => handleVote(question.id, "question", "upvote")}
            disabled={votingItem === question.id}
            style={styles.voteButton}
          >
            <Feather
              name="arrow-up"
              size={20}
              color={
                userVote === "upvote"
                  ? METUColors.actionGreen
                  : theme.textSecondary
              }
            />
          </Pressable>
          <ThemedText
            style={[
              styles.voteCountLarge,
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
            onPress={() => handleVote(question.id, "question", "downvote")}
            disabled={votingItem === question.id}
            style={styles.voteButton}
          >
            <Feather
              name="arrow-down"
              size={20}
              color={
                userVote === "downvote"
                  ? METUColors.alertRed
                  : theme.textSecondary
              }
            />
          </Pressable>
        </View>

        <View style={styles.responsesHeader}>
          <ThemedText style={styles.responsesLabel}>
            {answers.length} {answers.length === 1 ? t.answer : t.answers}
          </ThemedText>
        </View>
      </View>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyResponses}>
      <Feather name="message-circle" size={40} color={theme.textSecondary} />
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        {t.noAnswersYet}
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        {t.beFirstToAnswer}
      </ThemedText>
    </View>
  );

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
            {t.loadingQuestion}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={answers}
        renderItem={renderAnswer}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop, paddingBottom: paddingBottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      />

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
            styles.responseInput,
            { backgroundColor: theme.backgroundDefault, color: theme.text },
          ]}
          placeholder={t.writeAnswer}
          placeholderTextColor={theme.textSecondary}
          value={newResponse}
          onChangeText={setNewResponse}
          multiline
          editable={!isPosting}
        />
        <Pressable
          onPress={handleSubmitResponse}
          disabled={newResponse.trim().length === 0 || isPosting}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                newResponse.trim().length > 0 && !isPosting
                  ? METUColors.actionGreen
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
              size={18}
              color={
                newResponse.trim().length > 0 ? "#FFFFFF" : theme.textSecondary
              }
            />
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
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
  questionSection: {
    marginBottom: Spacing.lg,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  posterInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
    fontWeight: "600",
  },
  posterName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  postTime: {
    fontSize: Typography.small.fontSize,
  },
  categoryTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  questionTitle: {
    marginBottom: Spacing.md,
  },
  questionContent: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: Typography.caption.fontSize,
  },
  questionVoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  voteButton: {
    padding: Spacing.sm,
  },
  voteCountLarge: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  responsesHeader: {
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    paddingTop: Spacing.lg,
  },
  responsesLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  responseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
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
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  responseAuthorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  responseTime: {
    fontSize: Typography.caption.fontSize,
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  voteCount: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  responseContent: {
    fontSize: Typography.body.fontSize,
    lineHeight: 22,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  acceptButtonText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  emptyResponses: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: Typography.small.fontSize,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: Spacing.md,
    paddingBottom: Spacing["2xl"],
    borderTopWidth: 1,
    gap: Spacing.sm,
    alignItems: "flex-end",
  },
  responseInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
