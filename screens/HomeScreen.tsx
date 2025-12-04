import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HeroButtonProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  backgroundColor: string;
  onPress: () => void;
}

function HeroButton({
  title,
  subtitle,
  icon,
  backgroundColor,
  onPress,
}: HeroButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.heroButton, { backgroundColor }, animatedStyle]}
    >
      <View style={styles.heroButtonContent}>
        <View style={styles.heroButtonIcon}>
          <Feather name={icon} size={32} color="#FFFFFF" />
        </View>
        <View style={styles.heroButtonText}>
          <ThemedText style={styles.heroButtonTitle}>{title}</ThemedText>
          <ThemedText style={styles.heroButtonSubtitle}>{subtitle}</ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h2" style={styles.greeting}>
          Welcome to METU Help
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.tagline, { color: theme.textSecondary }]}
        >
          Connect with fellow students for instant campus support
        </ThemedText>
      </View>

      <View style={styles.buttonsContainer}>
        <HeroButton
          title="NEED HELP"
          subtitle="Yardim Istiyorum"
          icon="heart"
          backgroundColor={METUColors.actionGreen}
          onPress={() => navigation.navigate("NeedHelp")}
        />

        <HeroButton
          title="OFFER HELP"
          subtitle="Yardim Ediyorum"
          icon="users"
          backgroundColor={isDark ? "#CC3333" : METUColors.maroon}
          onPress={() => navigation.navigate("OfferHelp")}
        />
      </View>

      <View style={styles.statsContainer}>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather
            name="activity"
            size={20}
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText style={styles.statNumber}>24</ThemedText>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            Active Requests
          </ThemedText>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="check-circle" size={20} color={METUColors.actionGreen} />
          <ThemedText style={styles.statNumber}>156</ThemedText>
          <ThemedText
            type="small"
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            Helped Today
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  heroButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    minHeight: Spacing.largeButtonHeight,
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
    marginBottom: Spacing.xs,
  },
  heroButtonSubtitle: {
    fontSize: Typography.body.fontSize,
    color: "rgba(255, 255, 255, 0.8)",
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
