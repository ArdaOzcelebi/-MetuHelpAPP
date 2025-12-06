import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, METUColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://github.com/user-attachments/assets/e28f60a6-6719-49f6-8c71-9277f8ee9765" }}
        style={styles.icon}
        resizeMode="contain"
      />
      <ThemedText
        style={[
          styles.title,
          { color: isDark ? "#FFFFFF" : METUColors.maroon },
        ]}
      >
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});
