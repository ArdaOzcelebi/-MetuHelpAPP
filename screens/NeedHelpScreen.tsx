import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
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
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { subscribeToHelpRequests } from "@/src/services/helpRequestService";
import type { HelpRequest } from "@/src/types/helpRequest";

type NeedHelpScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "NeedHelp">;
};

/**
 * Calculate time difference from now
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, icon, isSelected, onPress }: FilterChipProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? isDark
              ? "#CC3333"
              : METUColors.maroon
            : theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={isSelected ? "#FFFFFF" : theme.text}
        style={styles.chipIcon}
      />
      <ThemedText
        style={[
          styles.chipText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface RequestCardProps {
  title: string;
  category: string;
  location: string;
  time: string;
  urgent: boolean;
  urgentLabel: string;
  helpButtonLabel: string;
  onPress: () => void;
  onHelp: () => void;
}

function RequestCard({
  title,
  category,
  location,
  time,
  urgent,
  urgentLabel,
  helpButtonLabel,
  onPress,
  onHelp,
}: RequestCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
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
        styles.requestCard,
        { backgroundColor: theme.cardBackground },
        animatedStyle,
      ]}
    >
      <View style={styles.requestContent}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: urgent
                ? "rgba(220, 38, 38, 0.1)"
                : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name={getCategoryIcon()}
            size={20}
            color={
              urgent
                ? METUColors.alertRed
                : isDark
                  ? "#FF6B6B"
                  : METUColors.maroon
            }
          />
        </View>
        <View style={styles.requestInfo}>
          <View style={styles.requestHeader}>
            <ThemedText style={styles.requestTitle}>{title}</ThemedText>
            {urgent ? (
              <View style={styles.urgentBadge}>
                <ThemedText style={styles.urgentText}>{urgentLabel}</ThemedText>
              </View>
            ) : null}
          </View>
          <View style={styles.requestMeta}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText
              style={[styles.requestLocation, { color: theme.textSecondary }]}
            >
              {location}
            </ThemedText>
            <ThemedText
              style={[styles.requestTime, { color: theme.textSecondary }]}
            >
              {time}
            </ThemedText>
          </View>
        </View>
      </View>
      <Pressable
        onPress={onHelp}
        style={({ pressed }) => [
          styles.helpButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <ThemedText style={styles.helpButtonText}>{helpButtonLabel}</ThemedText>
      </Pressable>
    </AnimatedPressable>
  );
}

export default function NeedHelpScreen({ navigation }: NeedHelpScreenProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToHelpRequests(
      (requests) => {
        setHelpRequests(requests);
        setLoading(false);
      },
      selectedCategory === "all" ? undefined : (selectedCategory as any),
    );

    return () => unsubscribe();
  }, [selectedCategory]);

  const CATEGORIES = [
    { id: "all", label: t.all, icon: "grid" },
    { id: "medical", label: t.medical, icon: "activity" },
    { id: "academic", label: t.academic, icon: "book" },
    { id: "transport", label: t.transport, icon: "navigation" },
    { id: "other", label: t.other, icon: "help-circle" },
  ] as const;

  const filteredRequests =
    selectedCategory === "all"
      ? helpRequests
      : helpRequests.filter((req) => req.category === selectedCategory);

  return (
    <ScreenScrollView>
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon as keyof typeof Feather.glyphMap}
              isSelected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.requestsList}>
        {loading ? (
          <ThemedText style={{ textAlign: "center", marginTop: Spacing.xl }}>
            Loading requests...
          </ThemedText>
        ) : filteredRequests.length === 0 ? (
          <ThemedText style={{ textAlign: "center", marginTop: Spacing.xl }}>
            No active requests found
          </ThemedText>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              title={request.title}
              category={request.category}
              location={request.location}
              time={getTimeAgo(request.createdAt)}
              urgent={request.urgent}
              urgentLabel={t.urgent}
              helpButtonLabel={t.iCanHelp}
              onPress={() =>
                navigation.navigate("RequestDetail", { requestId: request.id })
              }
              onHelp={() => {
                navigation.navigate("RequestDetail", { requestId: request.id });
              }}
            />
          ))
        )}
      </View>

      <Pressable
        onPress={() => navigation.navigate("PostNeed")}
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
  filterContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.xl,
  },
  filtersScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  requestsList: {
    gap: Spacing.md,
  },
  requestCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  requestContent: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  requestTitle: {
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
  requestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  requestLocation: {
    fontSize: Typography.small.fontSize,
  },
  requestTime: {
    fontSize: Typography.small.fontSize,
    marginLeft: Spacing.sm,
  },
  helpButton: {
    backgroundColor: METUColors.actionGreen,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-end",
  },
  helpButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
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
