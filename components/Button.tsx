import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};


export function Button({
  onPress,
  children,
  style,
  disabled = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };
  const handleHoverIn = () => {
    if (!disabled) {
      scale.value = withSpring(1.05, springConfig);
    }
    if (Platform.OS === 'web') {
        alert("HOVER DETECTED!"); 
    }
  };
  const handleHoverOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
      
    }
  };  
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={disabled}
style={[
        style, 
        { 
            zIndex: 9999,      // Force button to top layer
            cursor: 'pointer'  // Turn mouse into Hand icon (Web only)
        } 
      ]}
    >
  <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: theme.link,
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle, 
        ]}
    >
      <ThemedText
        type="body"
        style={[styles.buttonText, { color: theme.buttonText }]}
      >
        {children}
      </ThemedText>
    </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
