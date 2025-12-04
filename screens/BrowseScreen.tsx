import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
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
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

type BrowseScreenProps = {
  navigation: NativeStackNavigationProp<BrowseStackParamList, "Browse">;
};

const TABS = ["Needs", "Questions"] as const;

const MOCK_NEEDS = [
  {
    id: "1",
    title: "Need 1 Bandage",
    category: "medical",
    location: "Near Library",
    time: "5 min ago",
    urgent: true,
  },
  {
    id: "2",
    title: "Need Pain Reliever",
    category: "medical",
    location: "Engineering Building",
    time: "12 min ago",
    urgent: true,
  },
  {
    id: "3",
    title: "Need a Phone Charger (USB-C)",
    category: "other",
    location: "Student Center",
    time: "18 min ago",
    urgent: false,
  },
];

const MOCK_QUESTIONS = [
  {
    id: "1",
    title: "Best study spots on campus that are open late?",
    category: "Campus Life",
    responses: 8,
    time: "2h ago",
  },
  {
    id: "2",
    title: "How is CENG 242 with Prof. Ozyurt?",
    category: "Professors",
    responses: 3,
    time: "4h ago",
  },
  {
    id: "3",
    title: "Where can I find past exams for MATH 119?",
    category: "Classes",
    responses: 0,
    time: "5h ago",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BrowseScreen({ navigation }: BrowseScreenProps) {
  const { theme, isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("Needs");
  const [searchQuery, setSearchQuery] = useState("");

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

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  const filteredNeeds = MOCK_NEEDS.filter((need) =>
    need.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = MOCK_QUESTIONS.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenScrollView>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search..."
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
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              styles.tab,
              selectedTab === tab && {
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
                    selectedTab === tab
                      ? isDark
                        ? "#FF6B6B"
                        : METUColors.maroon
                      : theme.textSecondary,
                  fontWeight: selectedTab === tab ? "600" : "400",
                },
              ]}
            >
              {tab}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {selectedTab === "Needs" ? (
        <View style={styles.listContainer}>
          {filteredNeeds.map((need) => {
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
                  scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
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
                          <ThemedText style={styles.urgentText}>Urgent</ThemedText>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.needMeta}>
                      <Feather
                        name="map-pin"
                        size={12}
                        color={theme.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.needLocation,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {need.location}
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
          })}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredQuestions.map((question) => {
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
                <ThemedText style={styles.questionTitle}>
                  {question.title}
                </ThemedText>
                <View style={styles.questionMeta}>
                  <View
                    style={[
                      styles.categoryTag,
                      {
                        backgroundColor: `${getCategoryColor(question.category)}20`,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryTagText,
                        { color: getCategoryColor(question.category) },
                      ]}
                    >
                      {question.category}
                    </ThemedText>
                  </View>
                  <View style={styles.responsesContainer}>
                    <Feather
                      name="message-circle"
                      size={14}
                      color={
                        question.responses > 0
                          ? METUColors.actionGreen
                          : theme.textSecondary
                      }
                    />
                    <ThemedText
                      style={[
                        styles.responsesText,
                        {
                          color:
                            question.responses > 0
                              ? METUColors.actionGreen
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {question.responses}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.timeText, { color: theme.textSecondary }]}
                  >
                    {question.time}
                  </ThemedText>
                </View>
              </AnimatedPressable>
            );
          })}
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
    fontWeight: "500",
    marginBottom: Spacing.md,
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
