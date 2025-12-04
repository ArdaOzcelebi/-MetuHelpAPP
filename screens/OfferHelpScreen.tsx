import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
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

type OfferHelpScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "OfferHelp">;
};

const MOCK_QUESTIONS = [
  {
    id: "1",
    titleEn: "Best study spots on campus that are open late?",
    titleTr: "Kampuste gec saatlere kadar acik en iyi calisma yerleri?",
    categoryEn: "Campus Life",
    categoryTr: "Kampus Yasami",
    responses: 8,
    time: "2h",
    answered: true,
  },
  {
    id: "2",
    titleEn: "How is CENG 242 with Prof. Ozyurt?",
    titleTr: "Prof. Ozyurt ile CENG 242 nasil?",
    categoryEn: "Professors",
    categoryTr: "Hocalar",
    responses: 3,
    time: "4h",
    answered: true,
  },
  {
    id: "3",
    titleEn: "Where can I find past exams for MATH 119?",
    titleTr: "MATH 119 icin eski sinavlari nerede bulabilirim?",
    categoryEn: "Classes",
    categoryTr: "Dersler",
    responses: 0,
    time: "5h",
    answered: false,
  },
  {
    id: "4",
    titleEn: "Is the gym crowded during lunch hours?",
    titleTr: "Ogle saatlerinde spor salonu kalabalik mi?",
    categoryEn: "Campus Life",
    categoryTr: "Kampus Yasami",
    responses: 5,
    time: "6h",
    answered: true,
  },
  {
    id: "5",
    titleEn: "Tips for surviving PHYS 105 labs?",
    titleTr: "PHYS 105 laboratuvarlarindan sag cikma ipuclari?",
    categoryEn: "Classes",
    categoryTr: "Dersler",
    responses: 12,
    time: "8h",
    answered: true,
  },
  {
    id: "6",
    titleEn: "Which dormitory has the best wifi?",
    titleTr: "Hangi yurtta en iyi wifi var?",
    categoryEn: "Campus Life",
    categoryTr: "Kampus Yasami",
    responses: 0,
    time: "10h",
    answered: false,
  },
];

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
  title: string;
  category: string;
  responses: number;
  time: string;
  answered: boolean;
  responseLabel: string;
  responsesLabel: string;
  onPress: () => void;
}

function QuestionCard({
  title,
  category,
  responses,
  time,
  answered,
  responseLabel,
  responsesLabel,
  onPress,
}: QuestionCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const getCategoryColor = () => {
    switch (category) {
      case "Classes":
      case "Dersler":
        return isDark ? "#60A5FA" : "#3B82F6";
      case "Professors":
      case "Hocalar":
        return isDark ? "#A78BFA" : "#8B5CF6";
      case "Campus Life":
      case "Kampus Yasami":
        return isDark ? "#34D399" : "#10B981";
      default:
        return theme.textSecondary;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
      <ThemedText style={styles.questionTitle}>{title}</ThemedText>
      <View style={styles.questionMeta}>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: `${getCategoryColor()}20` },
          ]}
        >
          <ThemedText
            style={[styles.categoryTagText, { color: getCategoryColor() }]}
          >
            {category}
          </ThemedText>
        </View>
        <View style={styles.responsesContainer}>
          <Feather
            name="message-circle"
            size={14}
            color={answered ? METUColors.actionGreen : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.responsesText,
              {
                color: answered ? METUColors.actionGreen : theme.textSecondary,
              },
            ]}
          >
            {responses} {responses === 1 ? responseLabel : responsesLabel}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.timeText, { color: theme.textSecondary }]}
        >
          {time}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function OfferHelpScreen({ navigation }: OfferHelpScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<"recent" | "unanswered" | "popular">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const browseNavigation = useNavigation<
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

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    const title = language === "en" ? q.titleEn : q.titleTr;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedTab === "unanswered") {
      return matchesSearch && !q.answered;
    }
    if (selectedTab === "popular") {
      return matchesSearch && q.responses >= 5;
    }
    return matchesSearch;
  });

  return (
    <ScreenScrollView contentContainerStyle={styles.contentContainer}>
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
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              title={language === "en" ? question.titleEn : question.titleTr}
              category={language === "en" ? question.categoryEn : question.categoryTr}
              responses={question.responses}
              time={question.time}
              answered={question.answered}
              responseLabel={t.response}
              responsesLabel={t.responses}
              onPress={() => {
                browseNavigation.navigate("BrowseTab", {
                  screen: "QuestionDetail",
                  params: { questionId: question.id },
                } as any);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={48} color={theme.textSecondary} />
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

      <Pressable
        onPress={() => {
          browseNavigation.navigate("BrowseTab", {
            screen: "AskQuestion",
          } as any);
        }}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Feather name="edit-2" size={22} color="#FFFFFF" />
      </Pressable>
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
    marginBottom: Spacing.md,
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
