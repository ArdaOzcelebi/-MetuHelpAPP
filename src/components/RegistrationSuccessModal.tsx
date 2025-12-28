import React from "react";
import { Modal, View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegistrationModal } from "@/src/contexts/RegistrationModalContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";

export const RegistrationSuccessModal: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { isVisible, hideModal } = useRegistrationModal();
  const navigation = useNavigation();

  const handleGoToLogin = () => {
    hideModal();
    // Navigate to Login screen
    // @ts-ignore - navigation type issue with cross-navigator navigation
    navigation.navigate("Login");
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleGoToLogin}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={handleGoToLogin}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
            ]}
            onPress={() => {}}
          >
            {/* Mail Icon */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? "#9A2020" : METUColors.maroon },
                ]}
              >
                <Feather name="mail" size={40} color="#FFFFFF" />
              </View>
            </View>

            {/* Title */}
            <ThemedText type="h2" style={styles.modalTitle}>
              {t.verifyYourEmail}
            </ThemedText>

            {/* Message */}
            <ThemedText
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              {t.checkYourInbox}
            </ThemedText>

            {/* Go to Login Button */}
            <Button onPress={handleGoToLogin} style={styles.modalButton}>
              {t.goToLogin}
            </Button>
          </Pressable>
        </Pressable>
      </View>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalMessage: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  modalButton: {
    width: "100%",
  },
});
