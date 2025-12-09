import React, { useState } from "react";
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
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, rememberMe);
      setLoading(false);

      // Show success message
      Alert.alert(
        t.registrationSuccessful,
        t.verificationEmailSentMessage,
        [
          {
            text: t.ok,
            onPress: () => navigation.navigate("Login"),
          },
        ],
        { cancelable: false },
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.message || t.registrationFailed);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="h1" style={styles.title}>
              {t.createAccount}
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              {t.joinMetuCommunity}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.metuEmail}</ThemedText>
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
              <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
                {t.onlyMetuEmailsAllowed}
              </ThemedText>
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
              <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
                {t.passwordRequirements}
              </ThemedText>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.confirmPassword}</ThemedText>
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
                  placeholder={t.confirmPasswordPlaceholder}
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
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

            {/* Register Button */}
            <Button
              onPress={handleRegister}
              disabled={loading || !email || !password || !confirmPassword}
              style={styles.registerButton}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : t.signUp}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText
                style={[styles.loginText, { color: theme.textSecondary }]}
              >
                {t.alreadyHaveAccount}{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <ThemedText
                  style={[
                    styles.loginLink,
                    { color: isDark ? "#FF6B6B" : METUColors.maroon },
                  ]}
                >
                  {t.signIn}
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
  hint: {
    fontSize: Typography.caption.fontSize,
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
  registerButton: {
    marginTop: Spacing.md,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  loginText: {
    fontSize: Typography.small.fontSize,
  },
  loginLink: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
});
