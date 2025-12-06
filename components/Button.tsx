import React from "react";
import { StyleSheet, Pressable, Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// NOTE: I removed all your custom imports (@/components, @/hooks) 
// to ensure nothing else is breaking the button.

export function Button({ onPress, children, disabled }: any) {
  // 1. Hardcoded red box. No themes.
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleHoverIn = () => {
    // This MUST show up if the mouse touches the box
    console.log("SANITY CHECK: HOVER IN"); 
    scale.value = withSpring(1.2); // Grow BIG (20%)
  };

  const handleHoverOut = () => {
    console.log("SANITY CHECK: HOVER OUT");
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      // 2. Huge zIndex, massive red box. Impossible to miss.
      style={{
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        cursor: 'pointer', // Web only
      }}
    >
      <Animated.View
        style={[
          {
            width: 200,   // HARDCODED WIDTH
            height: 100,  // HARDCODED HEIGHT
            backgroundColor: 'red', // BRIGHT RED COLOR
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          },
          animatedStyle,
        ]}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
           TEST BUTTON
        </Text>
      </Animated.View>
    </Pressable>
  );
}
