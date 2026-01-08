import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { Spacing, BorderRadius, METUColors, Shadows } from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { subscribeToHelpRequests } from "@/src/services/helpRequestService";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Home">;
};

// Bento Widget Props
interface BentoWidgetProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
  size: "large" | "wide";
  delay?: number;
}

// Bento Grid Widget Component
function BentoWidget({
  title,
  subtitle,
  icon,
  gradientColors,
  onPress,
  size,
  delay = 0,
}: BentoWidgetProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 18, stiffness: 90 }),
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.bentoWidget,
        size === "large" ? styles.bentoLarge : styles.bentoWide,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.bentoTouchable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bentoGradient}
        >
          <View style={styles.bentoContent}>
            <View
              style={[
                styles.bentoIconContainer,
                size === "large"
                  ? styles.bentoIconLarge
                  : styles.bentoIconSmall,
              ]}
            >
              <Feather
                name={icon}
                size={size === "large" ? 40 : 32}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.bentoTextContainer}>
              <ThemedText
                style={[
                  styles.bentoTitle,
                  size === "large" && styles.bentoTitleLarge,
                ]}
              >
                {title}
              </ThemedText>
              {subtitle && (
                <ThemedText style={styles.bentoSubtitle}>{subtitle}</ThemedText>
              )}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Stats Ticker Component
function StatsTicker({
  activeCount,
  text,
  isDark,
}: {
  activeCount: number;
  text: string;
  isDark: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  useEffect(() => {
    opacity.value = withDelay(
      100,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
    translateY.value = withDelay(
      100,
      withSpring(0, { damping: 18, stiffness: 90 }),
    );
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.statsTicker, animatedStyle]}>
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={styles.statsBlur}
      >
        <Feather name="activity" size={16} color={METUColors.gold} />
        <ThemedText style={styles.statsText}>
          {activeCount} {text}
        </ThemedText>
      </BlurView>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeRequestCount, setActiveRequestCount] = useState(0);

  // Subscribe to active help requests for live stats
  useEffect(() => {
    const unsubscribe = subscribeToHelpRequests((requests) => {
      setActiveRequestCount(requests.length);
    });

    return () => unsubscribe();
  }, []);

  // Header animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });
  }, [headerOpacity, headerTranslateY]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Gradient colors based on theme
  const backgroundGradientColors = isDark
    ? (["#1A1A1A", "#2A2A2A"] as const)
    : (["#FAFAFA", "#FFFFFF"] as const);

  // Extract first name from user display name or email
  const getUserFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    if (user?.email) {
      const username = user.email.split("@")[0];
      // Get first part before dot and capitalize
      return (
        username.split(".")[0].charAt(0).toUpperCase() +
        username.split(".")[0].slice(1)
      );
    }
    return "Student";
  };

  // Create greeting
  const getGreeting = () => {
    return t.welcome;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={backgroundGradientColors}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: tabBarHeight + Spacing.xl + Spacing["6xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Ticker */}
        <StatsTicker
          activeCount={activeRequestCount}
          text={t.activeRequestsOnCampus}
          isDark={isDark}
        />

        {/* Header Section */}
        <Animated.View style={[styles.header, headerStyle]}>
          <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
          <ThemedText
            type="body"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            {t.tagline}
          </ThemedText>
        </Animated.View>

        {/* Bento Grid Container */}
        <View style={styles.bentoGrid}>
          {/* Top Row - Two Large Squares */}
          <View style={styles.bentoRow}>
            <BentoWidget
              title={t.urgentNeeds}
              subtitle={t.requestHelp}
              icon="heart"
              gradientColors={[
                isDark ? "#DC2626" : "#EF4444",
                isDark ? "#B91C1C" : "#DC2626",
              ]}
              onPress={() => navigation.navigate("PostNeed")}
              size="large"
              delay={200}
            />
            <BentoWidget
              title={t.offerHelp}
              subtitle={t.helpOthers}
              icon="users"
              gradientColors={[
                isDark ? "#059669" : "#10B981",
                isDark ? "#047857" : "#059669",
              ]}
              onPress={() => navigation.navigate("NeedHelp")}
              size="large"
              delay={350}
            />
          </View>

          {/* Bottom Row - Wide Forum Widget */}
          <BentoWidget
            title={t.qAndAForum}
            subtitle={t.qAndAForumDescription}
            icon="message-circle"
            gradientColors={
              isDark
                ? ["rgba(42, 42, 42, 0.95)", "rgba(58, 58, 58, 0.95)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 250, 0.95)"]
            }
            onPress={() => navigation.navigate("OfferHelp")}
            size="wide"
            delay={500}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statsTicker: {
    marginBottom: Spacing.lg,
  },
  statsBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  greeting: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 15,
    opacity: 0.8,
  },
  bentoGrid: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  bentoRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  bentoWidget: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.medium,
  },
  bentoLarge: {
    flex: 1,
    minHeight: 180,
  },
  bentoWide: {
    width: "100%",
    minHeight: 140,
  },
  bentoTouchable: {
    flex: 1,
  },
  bentoGradient: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  bentoContent: {
    gap: Spacing.md,
  },
  bentoIconContainer: {
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bentoIconLarge: {
    width: 72,
    height: 72,
  },
  bentoIconSmall: {
    width: 56,
    height: 56,
  },
  bentoTextContainer: {
    gap: Spacing.xs,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  bentoTitleLarge: {
    fontSize: 22,
  },
  bentoSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
});
