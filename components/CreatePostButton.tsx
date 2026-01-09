import React from "react";
import { Pressable, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, METUColors, Shadows } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Touch slop for better accessibility - expands touch target by 8px in all directions
const TOUCH_SLOP = {
  top: Spacing.sm,
  bottom: Spacing.sm,
  left: Spacing.sm,
  right: Spacing.sm,
};

interface CreatePostButtonProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

/**
 * Consistent header button for creating posts/questions.
 * Designed for React Navigation header integration via headerRight prop.
 *
 * Visual size: 40x40px
 * Touch target: 48x48px (enhanced with hitSlop for better accessibility)
 * Positioned in top right corner with 12px margin (Spacing.md)
 */
export function CreatePostButton({
  onPress,
  icon = "plus",
}: CreatePostButtonProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
        },
        animatedStyle,
      ]}
      hitSlop={TOUCH_SLOP}
    >
      <Feather name={icon} size={20} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    ...Shadows.small,
  },
});
