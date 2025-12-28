/**
 * ConfirmationModal - Custom confirmation dialog component
 *
 * This replaces React Native's Alert.alert for better Web compatibility.
 * Provides a clean, modern confirmation dialog that works consistently
 * across all platforms (iOS, Android, Web).
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import {
  METUColors,
  Spacing,
  BorderRadius,
  Typography,
} from "@/constants/theme";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmColor = METUColors.actionGreen,
  icon = "check-circle",
}: ConfirmationModalProps) {
  const { theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.cardBackground }]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${confirmColor}15` },
            ]}
          >
            <Feather name={icon} size={32} color={confirmColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: confirmColor,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.body.fontSize,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    // Styles applied inline
  },
  confirmButton: {
    // Styles applied inline
  },
  buttonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
});
