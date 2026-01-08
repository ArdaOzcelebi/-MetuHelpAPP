import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Spacing } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  icon: {
    width: 140,
    height: 140,
    marginRight: Spacing.sm,
    borderRadius: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});
