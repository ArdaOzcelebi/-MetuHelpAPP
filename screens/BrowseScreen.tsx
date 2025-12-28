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

type BrowseScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
};

const MOCK_NEEDS = [
  {
    id: "1",
    titleEn: "Need 1 Bandage",
    titleTr: "1 Bandaj Lazim",
    category: "medical",
    locationEn: "Near Library",
    locationTr: "Kutuphane Yakininda",
    time: "5 min",
    urgent: true,
  },
  {
    id: "2",
    titleEn: "Need Pain Reliever",
    titleTr: "Agri Kesici Lazim",
    category: "medical",
    locationEn: "Engineering Building",
    locationTr: "Muhendislik Binasi",
    time: "12 min",
    urgent: true,
  },
  {
    id: "3",
    titleEn: "Need a Phone Charger (USB-C)",
    titleTr: "Telefon Sarj Aleti (USB-C) Lazim",
    category: "other",
    locationEn: "Student Center",
    locationTr: "Ogrenci Merkezi",
    time: "18 min",
    urgent: false,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper component for animated need cards
function AnimatedNeedCard({
  need,
  navigation,
  theme,
  isDark,
  language,
  t,
  getCategoryIcon,
}: {
  need: (typeof MOCK_NEEDS)[0];
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
  theme: ReturnType<typeof useTheme>["theme"];
  isDark: boolean;
  language: string;
  t: any;
  getCategoryIcon: (category: string) => keyof typeof Feather.glyphMap;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      key={need.id}
      onPress={() =>
        navigation.navigate("RequestDetail", { requestId: need.id })
      }
      onPressIn={() => {
        scale.value = withSpring(0.98, {
          damping: 15,
          stiffness: 150,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
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
            <ThemedText style={styles.needTitle}>
              {language === "en" ? need.titleEn : need.titleTr}
            </ThemedText>
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
              {language === "en" ? need.locationEn : need.locationTr}
            </ThemedText>
            <ThemedText
              style={[styles.needTime, { color: theme.textSecondary }]}
            >
              {need.time}
            </ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// Helper component for animated question cards
function AnimatedQuestionCard({
  question,
  navigation,
  theme,
  getTimeAgo,
}: {
  question: QAQuestion;
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
  theme: ReturnType<typeof useTheme>["theme"];
  getTimeAgo: (date: Date) => string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      key={question.id}
      onPress={() =>
        navigation.navigate("QuestionDetail", {
          questionId: question.id,
        })
      }
      onPressIn={() => {
        scale.value = withSpring(0.98, {
          damping: 15,
          stiffness: 150,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.questionCard,
        { backgroundColor: "#FFFFFF" },
        animatedStyle,
      ]}
    >
      <ThemedText style={[styles.questionTitle, { color: "#1A1A1A" }]}>
        {question.title}
      </ThemedText>
      {question.body ? (
        <ThemedText
          style={[styles.questionBody, { color: "#666666" }]}
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
              question.answerCount > 0 ? METUColors.actionGreen : "#999999"
            }
          />
          <ThemedText
            style={[
              styles.responsesText,
              {
                color:
                  question.answerCount > 0 ? METUColors.actionGreen : "#999999",
              },
            ]}
          >
            {question.answerCount}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timeText, { color: "#999999" }]}>
          {getTimeAgo(question.createdAt)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function BrowseScreen({ navigation }: BrowseScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<"needs" | "questions">(
    "needs",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid too many Firebase queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Subscribe to questions from Firebase
  useEffect(() => {
    console.log("[BrowseScreen] Setting up questions subscription", {
      debouncedSearchQuery,
      isSearching: debouncedSearchQuery.length > 0,
    });
    setLoadingQuestions(true);

    const unsubscribe = subscribeToQuestions(
      (fetchedQuestions) => {
        console.log(
          `[BrowseScreen] Received ${fetchedQuestions.length} questions from subscription`,
        );
        setQuestions(fetchedQuestions);
        setLoadingQuestions(false);
        setRefreshing(false);
      },
      debouncedSearchQuery.length > 0
        ? { searchQuery: debouncedSearchQuery }
        : undefined,
    );

    return () => {
      console.log("[BrowseScreen] Cleaning up questions subscription");
      unsubscribe();
    };
  }, [debouncedSearchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    // The subscription will automatically update
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const TABS = [
    { id: "needs", label: t.needs },
    { id: "questions", label: t.questions },
  ] as const;

  const getCategoryIcon = (category: string): keyof typeof Feather.glyphMap => {
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
  };

  const filteredNeeds = MOCK_NEEDS.filter((need) => {
    const title = language === "en" ? need.titleEn : need.titleTr;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredQuestions = questions.filter((q) => {
    // Questions are already filtered by the subscription based on debouncedSearchQuery
    // No additional client-side filtering needed
    return true;
  });

  return (
    <ScreenScrollView
      style={{ backgroundColor: "#FAFAFA" }}
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
          {filteredNeeds.map((need) => (
            <AnimatedNeedCard
              key={need.id}
              need={need}
              navigation={navigation}
              theme={theme}
              isDark={isDark}
              language={language}
              t={t}
              getCategoryIcon={getCategoryIcon}
            />
          ))}
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
                  ? t.noQuestionsFound
                  : "No questions yet. Be the first to ask!"}
              </ThemedText>
            </View>
          ) : (
            filteredQuestions.map((question) => (
              <AnimatedQuestionCard
                key={question.id}
                question={question}
                navigation={navigation}
                theme={theme}
                getTimeAgo={getTimeAgo}
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
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: Spacing.xs,
  },
  questionBody: {
    fontSize: 14,
    color: "#666666",
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
    fontSize: 12,
    color: "#999999",
  },
  timeText: {
    fontSize: 12,
    color: "#999999",
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
