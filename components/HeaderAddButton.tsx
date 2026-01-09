import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, METUColors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HeaderAddButtonProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  accessibilityLabel?: string;
}

export function HeaderAddButton({
  onPress,
  icon = "plus",
  accessibilityLabel = "Create post",
}: HeaderAddButtonProps) {
  const { isDark, theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
        },
        animatedStyle,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Feather name={icon} size={20} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
});
