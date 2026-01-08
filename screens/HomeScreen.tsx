import React, { useEffect } from "react";
// FIXED: Added 'Platform' to imports
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCampusStats } from "@/hooks/useCampusStats";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Home">;
};

interface HeroButtonProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  backgroundColor: string;
  onPress: () => void;
}

// UPGRADED HERO BUTTON
function HeroButton({
  title,
  icon,
  backgroundColor,
  onPress,
}: HeroButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // --- INTERACTION HANDLERS ---

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    glowOpacity.value = withTiming(0.6, { duration: 150 });

    // SAFE HAPTICS: Only run on mobile
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    glowOpacity.value = withTiming(0, { duration: 300 });
  };

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.94, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );

    // SAFE HAPTICS: Only run on mobile
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress();
  };

  // WEB HOVER HANDLERS
  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      scale.value = withSpring(1.01, { damping: 15, stiffness: 200 });
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <View style={styles.heroButtonWrapper}>
      {/* Glow effect stays behind */}
      <Animated.View
        style={[styles.heroButtonGlow, { backgroundColor }, glowStyle]}
      />

      {/* Outer Shell: Handles Clicks & Hover */}
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={{ cursor: "pointer" }} // Hand cursor for web
      >
        {/* Inner Visuals: Handles Animation & Style */}
        <Animated.View
          style={[styles.heroButton, { backgroundColor }, animatedStyle]}
        >
          <View style={styles.heroButtonContent}>
            <View style={styles.heroButtonIcon}>
              <Feather name={icon} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.heroButtonText}>
              <ThemedText style={styles.heroButtonTitle}>{title}</ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color="#FFFFFF" />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Decorative circle component
function DecorativeCircle({
  size,
  top,
  left,
  right,
  bottom,
  color,
  delay = 0,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
  delay?: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(0.15, { duration: 800, easing: Easing.out(Easing.quad) }),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 20, stiffness: 90 }),
    );
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.decorativeCircle,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          right,
          bottom,
        },
      ]}
    />
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch campus statistics
  const stats = useCampusStats();

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const button1Opacity = useSharedValue(0);
  const button1TranslateY = useSharedValue(30);
  const button2Opacity = useSharedValue(0);
  const button2TranslateY = useSharedValue(30);
  const statsOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(20);

  useEffect(() => {
    // Staggered entrance animations
    headerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 90 });

    button1Opacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
    button1TranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 18, stiffness: 90 }),
    );

    button2Opacity.value = withDelay(
      350,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
    button2TranslateY.value = withDelay(
      350,
      withSpring(0, { damping: 18, stiffness: 90 }),
    );

    statsOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }),
    );
    statsTranslateY.value = withDelay(
      500,
      withSpring(0, { damping: 20, stiffness: 90 }),
    );
  }, [
    headerOpacity,
    headerTranslateY,
    button1Opacity,
    button1TranslateY,
    button2Opacity,
    button2TranslateY,
    statsOpacity,
    statsTranslateY,
  ]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Opacity.value,
    transform: [{ translateY: button1TranslateY.value }],
  }));

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Opacity.value,
    transform: [{ translateY: button2TranslateY.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }));

  // Gradient colors based on theme
  const gradientColors = isDark
    ? (["#1A1A1A", "#2A2A2A", "#1A1A1A"] as const)
    : (["#FFFFFF", "#FAFAFA", "#F5F5F5"] as const);

  const circleColor = isDark ? "#800000" : "#800000";

  return (
    <ThemedView style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={gradientColors}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <DecorativeCircle
        size={200}
        top={-50}
        right={-70}
        color={circleColor}
        delay={0}
      />
      <DecorativeCircle
        size={150}
        bottom={-40}
        left={-50}
        color={circleColor}
        delay={200}
      />
      <DecorativeCircle
        size={100}
        top={150}
        left={-30}
        color={isDark ? "#10B981" : METUColors.actionGreen}
        delay={400}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <ThemedText type="h2" style={styles.greeting}>
            {t.welcome}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            {t.tagline}
          </ThemedText>
        </Animated.View>

        <View style={styles.buttonsContainer}>
          <Animated.View style={button1Style}>
            <HeroButton
              title={t.needHelp}
              icon="heart"
              backgroundColor={METUColors.actionGreen}
              onPress={() => navigation.navigate("NeedHelp")}
            />
          </Animated.View>

          <Animated.View style={button2Style}>
            <HeroButton
              title={t.offerHelp}
              icon="users"
              backgroundColor={isDark ? "#CC3333" : METUColors.maroon}
              onPress={() => navigation.navigate("OfferHelp")}
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.statsContainer, statsStyle]}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather
              name="activity"
              size={20}
              color={isDark ? "#FF6B6B" : METUColors.maroon}
            />
            <ThemedText style={styles.statNumber}>
              {stats.loading ? "..." : stats.activeRequests}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              {t.activeRequests}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather
              name="check-circle"
              size={20}
              color={METUColors.actionGreen}
            />
            <ThemedText style={styles.statNumber}>
              {stats.loading ? "..." : stats.helpedToday}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              {t.helpedToday}
            </ThemedText>
          </View>
        </Animated.View>
      </View>
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
  decorativeCircle: {
    position: "absolute",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  greeting: {
    marginBottom: Spacing.sm,
  },
  tagline: {
    opacity: 0.8,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  heroButtonWrapper: {
    position: "relative",
  },
  heroButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    minHeight: Spacing.largeButtonHeight,
    overflow: "hidden",
  },
  heroButtonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
    transform: [{ scale: 1.05 }],
    opacity: 0,
  },
  heroButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  heroButtonText: {
    flex: 1,
  },
  heroButtonTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  statLabel: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
