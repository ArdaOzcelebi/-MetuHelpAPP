import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
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

const QUESTIONS_DATA: Record<
  string,
  {
    id: string;
    title: string;
    category: string;
    time: string;
    posterName: string;
    posterInitials: string;
    content: string;
    responses: {
      id: string;
      authorName: string;
      authorInitials: string;
      content: string;
      time: string;
      upvotes: number;
    }[];
  }
> = {
  "1": {
    id: "1",
    title: "Best study spots on campus that are open late?",
    category: "Campus Life",
    time: "2h ago",
    posterName: "Deniz T.",
    posterInitials: "DT",
    content:
      "I'm looking for quiet places to study that stay open past 10 PM. The library gets too crowded and closes early. Any suggestions?",
    responses: [
      {
        id: "r1",
        authorName: "Ece K.",
        authorInitials: "EK",
        content:
          "The 24-hour study room in the Student Center is great! It's on the 3rd floor.",
        time: "1h ago",
        upvotes: 12,
      },
      {
        id: "r2",
        authorName: "Baris M.",
        authorInitials: "BM",
        content:
          "Engineering building B block has study rooms open until midnight. Usually quiet too.",
        time: "45 min ago",
        upvotes: 8,
      },
      {
        id: "r3",
        authorName: "Selin A.",
        authorInitials: "SA",
        content:
          "Check out the cafeteria area after 8 PM - it's pretty empty and has good wifi.",
        time: "30 min ago",
        upvotes: 5,
      },
    ],
  },
  "2": {
    id: "2",
    title: "How is CENG 242 with Prof. Ozyurt?",
    category: "Professors",
    time: "4h ago",
    posterName: "Kaan Y.",
    posterInitials: "KY",
    content:
      "Planning to take CENG 242 next semester. Has anyone taken it with Prof. Ozyurt? How are the exams and workload?",
    responses: [
      {
        id: "r1",
        authorName: "Mert D.",
        authorInitials: "MD",
        content:
          "Took it last semester. Fair exams, but do the homeworks - they're worth a lot.",
        time: "3h ago",
        upvotes: 6,
      },
      {
        id: "r2",
        authorName: "Ayse N.",
        authorInitials: "AN",
        content:
          "Prof. Ozyurt is helpful during office hours. The course is challenging but manageable.",
        time: "2h ago",
        upvotes: 4,
      },
    ],
  },
  "3": {
    id: "3",
    title: "Where can I find past exams for MATH 119?",
    category: "Classes",
    time: "5h ago",
    posterName: "Burak S.",
    posterInitials: "BS",
    content:
      "Midterm is coming up and I need to practice. Does anyone have past exams or know where to find them?",
    responses: [],
  },
};

export default function QuestionDetailScreen({
  navigation,
  route,
}: QuestionDetailScreenProps) {
  const { theme, isDark } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { questionId } = route.params;
  const [newResponse, setNewResponse] = useState("");
  const [responses, setResponses] = useState(
    QUESTIONS_DATA[questionId]?.responses || [],
  );

  const question = QUESTIONS_DATA[questionId] || QUESTIONS_DATA["1"];

  const getCategoryColor = () => {
    switch (question.category) {
      case "Classes":
        return isDark ? "#60A5FA" : "#3B82F6";
      case "Professors":
        return isDark ? "#A78BFA" : "#8B5CF6";
      case "Campus Life":
        return isDark ? "#34D399" : "#10B981";
      default:
        return theme.textSecondary;
    }
  };

  const handleSubmitResponse = () => {
    if (newResponse.trim().length === 0) return;

    const newResp = {
      id: `r${Date.now()}`,
      authorName: "You",
      authorInitials: "ME",
      content: newResponse,
      time: "Just now",
      upvotes: 0,
    };

    setResponses([...responses, newResp]);
    setNewResponse("");
  };

  const renderResponse = ({ item }: { item: (typeof responses)[0] }) => (
    <View
      style={[
        styles.responseCard,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View style={styles.responseHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
          ]}
        >
          <ThemedText style={styles.avatarText}>
            {item.authorInitials}
          </ThemedText>
        </View>
        <View style={styles.responseAuthorInfo}>
          <ThemedText style={styles.authorName}>{item.authorName}</ThemedText>
          <ThemedText
            style={[styles.responseTime, { color: theme.textSecondary }]}
          >
            {item.time}
          </ThemedText>
        </View>
        <View style={styles.upvoteContainer}>
          <Feather name="arrow-up" size={16} color={METUColors.actionGreen} />
          <ThemedText
            style={[styles.upvoteCount, { color: METUColors.actionGreen }]}
          >
            {item.upvotes}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.responseContent}>{item.content}</ThemedText>
    </View>
  );

  const ListHeader = () => (
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
              {question.posterInitials}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.posterName}>
              {question.posterName}
            </ThemedText>
            <ThemedText
              style={[styles.postTime, { color: theme.textSecondary }]}
            >
              {question.time}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: `${getCategoryColor()}20` },
          ]}
        >
          <ThemedText
            style={[styles.categoryTagText, { color: getCategoryColor() }]}
          >
            {question.category}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h3" style={styles.questionTitle}>
        {question.title}
      </ThemedText>

      <ThemedText style={styles.questionContent}>{question.content}</ThemedText>

      <View style={styles.responsesHeader}>
        <ThemedText style={styles.responsesLabel}>
          {responses.length} {responses.length === 1 ? "Response" : "Responses"}
        </ThemedText>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyResponses}>
      <Feather name="message-circle" size={40} color={theme.textSecondary} />
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        No responses yet
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Be the first to help!
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={responses}
        renderItem={renderResponse}
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
          placeholder="Write a response..."
          placeholderTextColor={theme.textSecondary}
          value={newResponse}
          onChangeText={setNewResponse}
          multiline
        />
        <Pressable
          onPress={handleSubmitResponse}
          disabled={newResponse.trim().length === 0}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                newResponse.trim().length > 0
                  ? METUColors.actionGreen
                  : theme.backgroundSecondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="send"
            size={18}
            color={
              newResponse.trim().length > 0 ? "#FFFFFF" : theme.textSecondary
            }
          />
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
    marginBottom: Spacing["2xl"],
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
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  upvoteCount: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  responseContent: {
    fontSize: Typography.body.fontSize,
    lineHeight: 22,
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
