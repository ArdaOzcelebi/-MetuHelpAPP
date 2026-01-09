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

interface CreatePostButtonProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

/**
 * Consistent header button for creating posts/questions
 * Positioned in top right corner of screens via headerRight
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
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
