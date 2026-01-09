import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import { LOCATIONS, LOCATION_CATEGORIES, getLocationsByCategory, type LocationCategoryId } from "@/constants/locations";
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
import { useCallback } from "react";

type BrowseScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
  route: RouteProp<BrowseStackParamList, "Browse">;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper component for animated need cards
function AnimatedNeedCard({
  need,
  navigation,
  theme,
  isDark,
  t,
  getCategoryIcon,
  getTimeAgo,
  getLocationLabel,
}: {
  need: HelpRequest;
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
  theme: ReturnType<typeof useTheme>["theme"];
  isDark: boolean;
  t: any;
  getCategoryIcon: (category: string) => keyof typeof Feather.glyphMap;
  getTimeAgo: (date: Date) => string;
  getLocationLabel: (locationId: string) => string;
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
              {getLocationLabel(need.location)}
            </ThemedText>
            <ThemedText
              style={[styles.needTime, { color: theme.textSecondary }]}
            >
              {getTimeAgo(need.createdAt)}
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
        <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
          {getTimeAgo(question.createdAt)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function BrowseScreen({ navigation, route }: BrowseScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<"needs" | "questions">(
    "needs",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  // Update header button based on selected tab
  useEffect(() => {
    if (selectedTab === "questions") {
      navigation.setOptions({
        headerRight: () => (
          <HeaderAddButton
            onPress={() => navigation.navigate("AskQuestion")}
            accessibilityLabel="Ask a question"
          />
        ),
      });
    } else {
      // No button for needs tab
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [selectedTab, navigation]);

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

  const onRefresh = () => {
    setRefreshing(true);
    // The subscriptions will automatically update
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return t.justNow || "Just now";
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

  const getLocationLabel = (locationId: string): string => {
    const location = LOCATIONS.find((loc) => loc.id === locationId);
    if (!location) return locationId;
    return language === "en" ? location.labelEn : location.labelTr;
  };

  const filteredNeeds = helpRequests.filter((need) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      need.title.toLowerCase().includes(searchLower) ||
      need.description.toLowerCase().includes(searchLower) ||
      need.location.toLowerCase().includes(searchLower);
    
    const matchesLocation = selectedLocation 
      ? need.location === selectedLocation
      : true;
    
    return matchesSearch && matchesLocation;
  });

  const filteredQuestions = questions.filter((q) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(searchLower) ||
      q.body.toLowerCase().includes(searchLower)
    );
  });

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

      {/* Location Filter - Only show on needs tab */}
      {selectedTab === "needs" && (
        <View style={styles.locationFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationScrollContent}
          >
            {/* All Locations filter */}
            <Pressable
              onPress={() => {
                setSelectedLocation(null);
                setSelectedCategory(null);
              }}
              style={[
                styles.locationChip,
                {
                  backgroundColor: !selectedLocation && !selectedCategory
                    ? isDark
                      ? "#CC3333"
                      : METUColors.maroon
                    : theme.backgroundDefault,
                  borderWidth: !selectedLocation && !selectedCategory ? 0 : 1,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.locationChipText,
                  {
                    color: !selectedLocation && !selectedCategory
                      ? "#FFFFFF"
                      : theme.text,
                    fontWeight: !selectedLocation && !selectedCategory ? "600" : "400",
                  },
                ]}
              >
                {language === "en" ? "All Locations" : "Tüm Konumlar"}
              </ThemedText>
            </Pressable>

            {/* Category filters */}
            {!selectedCategory && LOCATION_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.locationChip,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Feather 
                  name={category.icon} 
                  size={14} 
                  color={theme.text} 
                  style={{ marginRight: 6 }}
                />
                <ThemedText
                  style={[
                    styles.locationChipText,
                    {
                      color: theme.text,
                      fontWeight: "400",
                    },
                  ]}
                >
                  {language === "en" ? category.labelEn : category.labelTr}
                </ThemedText>
              </Pressable>
            ))}

            {/* Individual location filters - show when category is selected */}
            {selectedCategory && (
              <>
                {/* Back button */}
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  style={[
                    styles.locationChip,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderWidth: 1,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Feather 
                    name="arrow-left" 
                    size={14} 
                    color={theme.text} 
                    style={{ marginRight: 6 }}
                  />
                  <ThemedText
                    style={[
                      styles.locationChipText,
                      {
                        color: theme.text,
                        fontWeight: "500",
                      },
                    ]}
                  >
                    {language === "en" ? "Back" : "Geri"}
                  </ThemedText>
                </Pressable>

                {selectedCategory && getLocationsByCategory(selectedCategory as LocationCategoryId).map((location) => (
                  <Pressable
                    key={location.id}
                    onPress={() => setSelectedLocation(location.id)}
                    style={[
                      styles.locationChip,
                      {
                        backgroundColor:
                          selectedLocation === location.id
                            ? isDark
                              ? "#CC3333"
                              : METUColors.maroon
                            : theme.backgroundDefault,
                        borderWidth: selectedLocation === location.id ? 0 : 1,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.locationChipText,
                        {
                          color:
                            selectedLocation === location.id
                              ? "#FFFFFF"
                              : theme.text,
                          fontWeight:
                            selectedLocation === location.id ? "600" : "400",
                        },
                      ]}
                    >
                      {language === "en" ? location.labelEn : location.labelTr}
                    </ThemedText>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}

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
                getTimeAgo={getTimeAgo}
                getLocationLabel={getLocationLabel}
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
                getTimeAgo={getTimeAgo}
              />
            ))
          )}
        </View>
      )}
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
  locationFilterContainer: {
    marginVertical: Spacing.sm,
  },
  locationScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  locationChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.sm,
  },
  locationChipText: {
    fontSize: Typography.small.fontSize,
  },
});
