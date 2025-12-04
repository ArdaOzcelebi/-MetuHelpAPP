import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, METUColors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, isDark } = useTheme();
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
      onPress={toggleLanguage}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(128, 0, 0, 0.1)",
        },
        animatedStyle,
      ]}
      accessibilityLabel={`Switch to ${language === "en" ? "Turkish" : "English"}`}
      accessibilityRole="button"
    >
      <Feather
        name="globe"
        size={16}
        color={isDark ? "#FFFFFF" : METUColors.maroon}
      />
      <ThemedText
        style={[
          styles.label,
          { color: isDark ? "#FFFFFF" : METUColors.maroon },
        ]}
      >
        {language === "en" ? "TR" : "EN"}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
