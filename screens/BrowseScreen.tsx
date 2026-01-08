import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";
import {
  subscribeToQuestions,
  type QAQuestion,
} from "@/src/services/qaService";
import {
  subscribeToHelpRequests,
  type HelpRequest,
} from "@/src/services/helpRequestService";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { getShortTimeAgo } from "@/src/utils/timeUtils";

type BrowseScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
  route: RouteProp<BrowseStackParamList, "Browse">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper component for animated need cards - Memoized for performance
const AnimatedNeedCard = memo(
  ({
    need,
    navigation,
    theme,
    isDark,
    t,
    getCategoryIcon,
  }: {
    need: HelpRequest;
    navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
    theme: ReturnType<typeof useTheme>["theme"];
    isDark: boolean;
    t: any;
    getCategoryIcon: (category: string) => keyof typeof Feather.glyphMap;
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback(() => {
      navigation.navigate("RequestDetail", { requestId: need.id });
    }, [navigation, need.id]);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 150,
      });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, [scale]);

    const timeAgo = useMemo(() => getShortTimeAgo(need.createdAt), [need.createdAt]);

    return (
      <AnimatedPressable
        key={need.id}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.needCard,
          { backgroundColor: theme.cardBackground },
          animatedStyle,
        ]}
      >
        <View style={styles.needContent}>
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor: need.urgent
                  ? "rgba(220, 38, 38, 0.1)"
                  : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name={getCategoryIcon(need.category)}
              size={20}
              color={
                need.urgent
                  ? METUColors.alertRed
                  : isDark
                    ? "#FF6B6B"
                    : METUColors.maroon
              }
            />
          </View>
          <View style={styles.needInfo}>
            <View style={styles.needHeader}>
              <ThemedText style={styles.needTitle}>{need.title}</ThemedText>
              {need.urgent ? (
                <View style={styles.urgentBadge}>
                  <ThemedText style={styles.urgentText}>{t.urgent}</ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.needMeta}>
              <Feather name="map-pin" size={12} color={theme.textSecondary} />
              <ThemedText
                style={[styles.needLocation, { color: theme.textSecondary }]}
              >
                {need.location}
              </ThemedText>
              <ThemedText
                style={[styles.needTime, { color: theme.textSecondary }]}
              >
                {timeAgo}
              </ThemedText>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    );
  },
);

// Helper component for animated question cards - Memoized for performance
const AnimatedQuestionCard = memo(
  ({
    question,
    navigation,
    theme,
  }: {
    question: QAQuestion;
    navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
    theme: ReturnType<typeof useTheme>["theme"];
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback(() => {
      navigation.navigate("QuestionDetail", {
        questionId: question.id,
      });
    }, [navigation, question.id]);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 150,
      });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, [scale]);

    const timeAgo = useMemo(() => getShortTimeAgo(question.createdAt), [question.createdAt]);

    return (
      <AnimatedPressable
        key={question.id}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
              color={
                question.answerCount > 0
                  ? METUColors.actionGreen
                  : theme.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.responsesText,
                {
                  color:
                    question.answerCount > 0
                      ? METUColors.actionGreen
                      : theme.textSecondary,
                },
              ]}
            >
              {question.answerCount}
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.timeText, { color: theme.textSecondary }]}
          >
            {timeAgo}
          </ThemedText>
        </View>
      </AnimatedPressable>
    );
  },
);

export default function BrowseScreen({ navigation, route }: BrowseScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<"needs" | "questions">(
    "needs",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingNeeds, setLoadingNeeds] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Handle tab selection when screen is focused
  // Reset to "needs" by default, but respect initialTab parameter if provided
  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialTab) {
        // Navigate to specific tab (e.g., from AskQuestionScreen)
        setSelectedTab(route.params.initialTab);
        // Clear the param so it doesn't persist on next focus
        navigation.setParams({ initialTab: undefined });
      } else {
        // Default behavior: reset to "needs" tab
        setSelectedTab("needs");
      }
    }, [route.params?.initialTab, navigation]),
  );

  // Subscribe to questions from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToQuestions((fetchedQuestions) => {
      setQuestions(fetchedQuestions);
      setLoadingQuestions(false);
      setRefreshing(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to help requests from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToHelpRequests((fetchedRequests) => {
      setHelpRequests(fetchedRequests);
      setLoadingNeeds(false);
      setRefreshing(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The subscriptions will automatically update
  }, []);

  // Memoize getCategoryIcon function
  const getCategoryIcon = useCallback(
    (category: string): keyof typeof Feather.glyphMap => {
      switch (category) {
        case "medical":
          return "activity";
        case "academic":
          return "book";
        case "transport":
          return "navigation";
        default:
          return "help-circle";
      }
    },
    [],
  );

  // Memoize filtered arrays to avoid recalculating on every render
  const filteredNeeds = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return helpRequests.filter((need) => {
      return (
        need.title.toLowerCase().includes(searchLower) ||
        need.description.toLowerCase().includes(searchLower) ||
        need.location.toLowerCase().includes(searchLower)
      );
    });
  }, [helpRequests, searchQuery]);

  const filteredQuestions = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return questions.filter((q) => {
      return (
        q.title.toLowerCase().includes(searchLower) ||
        q.body.toLowerCase().includes(searchLower)
      );
    });
  }, [questions, searchQuery]);

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
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
          placeholder={t.search}
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
          <Pressable
            key={tab.id}
            onPress={() => setSelectedTab(tab.id as "needs" | "questions")}
            style={[
              styles.tab,
              selectedTab === tab.id && {
                borderBottomWidth: 2,
                borderBottomColor: isDark ? "#FF6B6B" : METUColors.maroon,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color:
                    selectedTab === tab.id
                      ? isDark
                        ? "#FF6B6B"
                        : METUColors.maroon
                      : theme.textSecondary,
                  fontWeight: selectedTab === tab.id ? "600" : "400",
                },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {selectedTab === "needs" ? (
        <View style={styles.listContainer}>
          {loadingNeeds ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={METUColors.maroon} />
            </View>
          ) : filteredNeeds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="heart" size={64} color={theme.textSecondary} />
              <ThemedText style={styles.emptyText}>
                {searchQuery
                  ? t.noRequestsFound || "No requests found"
                  : t.noActiveRequests ||
                    "No active requests. Be the first to post!"}
              </ThemedText>
            </View>
          ) : (
            filteredNeeds.map((need) => (
              <AnimatedNeedCard
                key={need.id}
                need={need}
                navigation={navigation}
                theme={theme}
                isDark={isDark}
                t={t}
                getCategoryIcon={getCategoryIcon}
              />
            ))
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {loadingQuestions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={METUColors.maroon} />
            </View>
          ) : filteredQuestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather
                name="message-circle"
                size={64}
                color={theme.textSecondary}
              />
              <ThemedText style={styles.emptyText}>
                {searchQuery
                  ? t.noQuestionsFound || "No questions found"
                  : t.noQuestions || "No questions yet. Be the first to ask!"}
              </ThemedText>
            </View>
          ) : (
            filteredQuestions.map((question) => (
              <AnimatedQuestionCard
                key={question.id}
                question={question}
                navigation={navigation}
                theme={theme}
              />
            ))
          )}
        </View>
      )}

      <Pressable
        onPress={() => navigation.navigate("AskQuestion")}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
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
  listContainer: {
    gap: Spacing.md,
    paddingBottom: Spacing["6xl"],
  },
  needCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  needContent: {
    flexDirection: "row",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  needInfo: {
    flex: 1,
  },
  needHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  needTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: METUColors.alertRed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  needMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  needLocation: {
    fontSize: Typography.small.fontSize,
  },
  needTime: {
    fontSize: Typography.small.fontSize,
    marginLeft: Spacing.sm,
  },
  questionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  questionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  questionBody: {
    fontSize: Typography.small.fontSize,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
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
  loadingContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: Spacing.lg,
    fontSize: Typography.body.fontSize,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: Spacing["6xl"],
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
