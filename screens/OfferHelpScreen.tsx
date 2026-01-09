import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import type { MainTabParamList } from "@/navigation/MainTabNavigator";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";
import { subscribeToQuestions, type Question } from "@/src/services/qaService";

type OfferHelpScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "OfferHelp">;
};

// Helper function to get time ago string
function getTimeAgo(timestamp: any): string {
  // Handle both Firestore Timestamp and Date objects
  let date: Date;
  if (timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return "Just now";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function TabButton({ label, isSelected, onPress }: TabButtonProps) {
  const { theme, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        isSelected && {
          borderBottomWidth: 2,
          borderBottomColor: isDark ? "#FF6B6B" : METUColors.maroon,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.tabText,
          {
            color: isSelected
              ? isDark
                ? "#FF6B6B"
                : METUColors.maroon
              : theme.textSecondary,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface QuestionCardProps {
  question: Question;
  responseLabel: string;
  responsesLabel: string;
  onPress: () => void;
}

function QuestionCard({
  question,
  responseLabel,
  responsesLabel,
  onPress,
}: QuestionCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const timeAgo = question.createdAt
    ? getTimeAgo(question.createdAt)
    : "Just now";
  const answerCount = question.answerCount || 0;
  const hasAnswers = answerCount > 0;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.questionCard,
        { backgroundColor: theme.cardBackground },
        animatedStyle,
      ]}
    >
      <ThemedText style={styles.questionTitle}>{question.title}</ThemedText>
      {question.body ? (
        <ThemedText
          style={[styles.questionBody, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {question.body}
        </ThemedText>
      ) : null}
      <View style={styles.questionMeta}>
        <View style={styles.responsesContainer}>
          <Feather
            name="message-circle"
            size={14}
            color={hasAnswers ? METUColors.actionGreen : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.responsesText,
              {
                color: hasAnswers
                  ? METUColors.actionGreen
                  : theme.textSecondary,
              },
            ]}
          >
            {answerCount} {answerCount === 1 ? responseLabel : responsesLabel}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
          {timeAgo}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function OfferHelpScreen({ navigation }: OfferHelpScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<
    "recent" | "unanswered" | "popular"
  >("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const browseNavigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<MainTabParamList>,
        NativeStackNavigationProp<BrowseStackParamList>
      >
    >();

  const TABS = [
    { id: "recent", label: t.recent },
    { id: "unanswered", label: t.unanswered },
    { id: "popular", label: t.popular },
  ] as const;

  // Subscribe to real-time questions from Firebase
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToQuestions((fetchedQuestions) => {
      setQuestions(fetchedQuestions);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (selectedTab === "unanswered") {
      return matchesSearch && (!q.answerCount || q.answerCount === 0);
    }
    if (selectedTab === "popular") {
      return matchesSearch && (q.answerCount || 0) >= 5;
    }
    return matchesSearch;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // The subscription will automatically update with new data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScreenScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isDark ? "#FF6B6B" : METUColors.maroon}
          colors={[isDark ? "#FF6B6B" : METUColors.maroon]}
        />
      }
    >
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t.searchQuestions}
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

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isSelected={selectedTab === tab.id}
            onPress={() => setSelectedTab(tab.id as typeof selectedTab)}
          />
        ))}
      </View>

      <View style={styles.questionsList}>
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
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              responseLabel={t.response}
              responsesLabel={t.responses}
              onPress={() => {
                navigation.navigate("QuestionDetail", {
                  questionId: question.id,
                });
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather
              name="message-circle"
              size={48}
              color={theme.textSecondary}
            />
            <ThemedText
              style={[styles.emptyTitle, { color: theme.textSecondary }]}
            >
              {t.noQuestionsFound}
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              {t.beFirstToAsk}
            </ThemedText>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: Spacing["6xl"] + 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    height: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  tabText: {
    fontSize: Typography.body.fontSize,
  },
  questionsList: {
    gap: Spacing.md,
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  questionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  questionBody: {
    fontSize: Typography.small.fontSize,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryTagText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: "500",
  },
  responsesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  responsesText: {
    fontSize: Typography.small.fontSize,
  },
  timeText: {
    fontSize: Typography.small.fontSize,
    marginLeft: "auto",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
  },
});
