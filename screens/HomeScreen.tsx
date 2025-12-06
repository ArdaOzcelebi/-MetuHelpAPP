import React, { useEffect } from "react";
// FIXED: Added 'Platform' to imports
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    if (Platform.OS !== 'web') {
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
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    
    // SAFE HAPTICS: Only run on mobile
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress();
  };

  // WEB HOVER HANDLERS
  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      scale.value = withSpring(1.02, { damping: 15, stiffness: 200 });
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <View style={styles.heroButtonWrapper}>
      {/* Glow effect stays behind */}
      <Animated.View
        style={[
          styles.heroButtonGlow,
          { backgroundColor },
          glowStyle,
        ]}
      />
      
      {/* Outer Shell: Handles Clicks & Hover */}
      <Pressable
