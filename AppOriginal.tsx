import React from "react";
import { View, Text } from "react-native";
import Constants from "expo-constants";

console.log("expoConfig.extra ->", Constants.expoConfig?.extra);

export default function App(): JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>METU Help — Minimal Test App</Text>
      <Text style={{ marginTop: 8, color: "#666" }}>
        If you see this, the renderer is working. Paste any expo/terminal errors if it doesn't.
      </Text>
    </View>
  );
}