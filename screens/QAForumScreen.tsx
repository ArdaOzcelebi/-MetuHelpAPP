import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { subscribeToQuestions } from "@/src/services/questionService";
import type { Question } from "@/src/types/question";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type QAForumScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
};

export default function QAForumScreen({ navigation }: QAForumScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load questions from Firebase
  const loadQuestions = useCallback(() => {
    setLoading(true);
    const unsubscribe = subscribeToQuestions(
      (updatedQuestions) => {
        setQuestions(updatedQuestions);
        setLoading(false);
        setRefreshing(false);
      },
      {
        status: "open",
        sortBy: "recent",
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = loadQuestions();
    return () => unsubscribe();
  }, [loadQuestions]);

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The subscription will automatically update the questions
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Filter questions by search
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("QuestionDetail", { questionId: item.id })
      }
      style={({ pressed }) => [
        styles.questionCard,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <ThemedText style={styles.questionTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          {item.body ? (
            <ThemedText
              style={[styles.questionBody, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {item.body}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.questionFooter}>
        <View style={styles.authorInfo}>
          <View
            style={[
              styles.avatarSmall,
              { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
            ]}
          >
            <ThemedText style={styles.avatarTextSmall}>
              {item.author.name.substring(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.authorName, { color: theme.textSecondary }]}
          >
            {item.author.name}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          {/* Vote count */}
          <View style={styles.stat}>
            <Feather
              name="arrow-up"
              size={14}
              color={item.votes > 0 ? METUColors.actionGreen : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.statText,
                {
                  color:
                    item.votes > 0 ? METUColors.actionGreen : theme.textSecondary,
                },
              ]}
            >
              {item.votes}
            </ThemedText>
          </View>

          {/* Answer count */}
          <View style={styles.stat}>
            <Feather
              name="message-circle"
              size={14}
              color={
                item.answerCount > 0
                  ? METUColors.actionGreen
                  : theme.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.statText,
                {
                  color:
                    item.answerCount > 0
                      ? METUColors.actionGreen
                      : theme.textSecondary,
                },
              ]}
            >
              {item.answerCount}
            </ThemedText>
          </View>

          {/* Time */}
          <ThemedText
            style={[styles.timeText, { color: theme.textSecondary }]}
          >
            {getTimeAgo(item.createdAt)}
          </ThemedText>

          {/* Accepted answer indicator */}
          {item.hasAcceptedAnswer ? (
            <Feather name="check-circle" size={14} color={METUColors.actionGreen} />
          ) : null}
        </View>
      </View>

      {/* Tags */}
      {item.tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                { backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5" },
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
    </Pressable>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={64} color={theme.textSecondary} />
      <ThemedText style={[styles.emptyTitle, { marginTop: Spacing.lg }]}>
        No Questions Yet
      </ThemedText>
      <ThemedText
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        Be the first to ask a question!
      </ThemedText>
      <Pressable
        onPress={() => navigation.navigate("AskQuestion")}
        style={[
          styles.askButton,
          { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
        ]}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText style={styles.askButtonText}>Ask a Question</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with search and refresh */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search questions..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={onRefresh}
          style={[
            styles.refreshButton,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="refresh-cw" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* Questions list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading questions...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#FF6B6B" : METUColors.maroon}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating action button */}
      <Pressable
        onPress={() => navigation.navigate("AskQuestion")}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    height: "100%",
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
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
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    marginBottom: Spacing.md,
  },
  questionInfo: {
    gap: Spacing.xs,
  },
  questionTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: "600",
    lineHeight: 22,
  },
  questionBody: {
    fontSize: Typography.small.fontSize,
    lineHeight: 18,
  },
  questionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextSmall: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  authorName: {
    fontSize: Typography.caption.fontSize,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: "600",
  },
  timeText: {
    fontSize: Typography.caption.fontSize,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    fontSize: Typography.caption.fontSize,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  askButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
