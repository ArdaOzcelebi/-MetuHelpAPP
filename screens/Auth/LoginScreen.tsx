import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { hasFirebaseConfig } from "@/src/firebase/firebaseConfig";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { signIn, resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn(email, password, rememberMe);
      // Navigation will be handled by App.tsx based on auth state
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        // Show alert with option to resend verification email
        Alert.alert(
          t.emailNotVerified,
          t.emailNotVerifiedMessage,
          [
            {
              text: t.cancel,
              style: "cancel",
            },
            {
              text: t.resendVerification,
              onPress: handleResendVerification,
            },
          ],
          { cancelable: true },
        );
      } else {
        setError(err.message || t.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      Alert.alert(t.success, t.verificationEmailSent);
    } catch (err: any) {
      Alert.alert(t.error, err.message || t.failedToSendVerification);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Firebase Configuration Warning */}
          {!hasFirebaseConfig && (
            <View style={styles.warningContainer}>
              <Feather name="alert-triangle" size={20} color="#F59E0B" />
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningTitle}>Demo Mode</ThemedText>
                <ThemedText style={styles.warningText}>
                  Firebase is not configured. Authentication will not work. See
                  FIREBASE_AUTH_SETUP.md for setup instructions.
                </ThemedText>
              </View>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="h1" style={styles.title}>
              {t.welcomeBack}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              {t.signInToContinue}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.password}</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Remember Me */}
            <Pressable
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: rememberMe
                      ? isDark
                        ? "#FF6B6B"
                        : METUColors.maroon
                      : "transparent",
                  },
                ]}
              >
                {rememberMe && (
                  <Feather name="check" size={16} color="#FFFFFF" />
                )}
              </View>
              <ThemedText style={styles.rememberMeText}>
                {t.rememberMe}
              </ThemedText>
            </Pressable>

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

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              disabled={loading || !email || !password}
              style={styles.loginButton}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : t.signIn}
            </Button>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <ThemedText
                style={[styles.registerText, { color: theme.textSecondary }]}
              >
                {t.dontHaveAccount}{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <ThemedText
                  style={[
                    styles.registerLink,
                    { color: isDark ? "#FF6B6B" : METUColors.maroon },
                  ]}
                >
                  {t.signUp}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.sm,
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
  eyeIcon: {
    padding: Spacing.sm,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberMeText: {
    fontSize: Typography.small.fontSize,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    fontSize: Typography.small.fontSize,
    flex: 1,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  registerText: {
    fontSize: Typography.small.fontSize,
  },
  registerLink: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: Spacing["2xl"],
  },
  warningTextContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  warningTitle: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    color: "#F59E0B",
  },
  warningText: {
    fontSize: Typography.caption.fontSize,
    color: "#92400E",
    lineHeight: 16,
  },
});
