import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    // Basic email validation
    if (!email) {
      setError(t.emailRequired);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email);
      setEmail("");
      onClose();
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
            onPress={() => {}}
          >
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="h2" style={styles.title}>
                {t.resetPassword}
              </ThemedText>
              <ThemedText
                style={[styles.description, { color: theme.textSecondary }]}
              >
                {t.enterEmailForReset}
              </ThemedText>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.email}</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather
                  name="mail"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Feather
                  name="alert-circle"
                  size={16}
                  color={METUColors.alertRed}
                />
                <ThemedText
                  style={[styles.errorText, { color: METUColors.alertRed }]}
                >
                  {error}
                </ThemedText>
              </View>
            ) : null}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleSubmit}
                disabled={loading || !email}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  t.sendResetLink
                )}
              </Button>
              <Pressable onPress={handleClose} disabled={loading}>
                <ThemedText
                  style={[
                    styles.cancelText,
                    { color: theme.textSecondary },
                    loading && { opacity: 0.5 },
                  ]}
                >
                  {t.cancel}
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
    zIndex: 1,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.small.fontSize,
    lineHeight: 20,
  },
  inputContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.small.fontSize,
    flex: 1,
  },
  buttonContainer: {
    gap: Spacing.md,
    alignItems: "center",
  },
  submitButton: {
    width: "100%",
  },
  cancelText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
});
