import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const { signUp, resendVerificationEmail, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t.pleaseFieldAll || "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp(email, password, rememberMe);
      setRegistrationSuccess(true);
      
      Alert.alert(
        t.registrationSuccess || "Registration Successful",
        t.checkEmailVerification || "A verification email has been sent to your email address. Please verify your email before logging in.",
        [
          {
            text: t.ok || "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    
    try {
      await resendVerificationEmail();
      Alert.alert(
        t.emailSent || "Email Sent",
        t.verificationEmailResent || "Verification email has been resent. Please check your inbox.",
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess && user && !user.emailVerified) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.successContent}>
          <View style={[styles.iconCircle, { backgroundColor: METUColors.actionGreen }]}>
            <Feather name="mail" size={48} color="#FFFFFF" />
          </View>
          <ThemedText type="h3" style={styles.successTitle}>
            {t.verifyEmail || "Verify Your Email"}
          </ThemedText>
          <ThemedText style={[styles.successMessage, { color: theme.textSecondary }]}>
            {t.verificationEmailSent ||
              "We've sent a verification email to your address. Please check your inbox and click the verification link."}
          </ThemedText>
          
          <Pressable
            style={({ pressed }) => [
              styles.resendButton,
              {
                backgroundColor: theme.backgroundDefault,
                opacity: pressed || loading ? 0.7 : 1,
              },
            ]}
            onPress={handleResendVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={isDark ? "#FF6B6B" : METUColors.maroon} />
            ) : (
              <>
                <Feather
                  name="refresh-cw"
                  size={20}
                  color={isDark ? "#FF6B6B" : METUColors.maroon}
                />
                <ThemedText
                  style={[
                    styles.resendButtonText,
                    { color: isDark ? "#FF6B6B" : METUColors.maroon },
                  ]}
                >
                  {t.resendVerification || "Resend Verification Email"}
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => navigation.navigate("Login")}
          >
            <ThemedText style={styles.backButtonText}>
              {t.backToLogin || "Back to Login"}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="h2" style={styles.title}>
              {t.createAccount || "Create Account"}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t.joinMetuHelp || "Join METU Help community"}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.email || "Email"}</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <Feather name="mail" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="student@metu.edu.tr"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
                {t.onlyMetuEmail || "Only @metu.edu.tr emails are allowed"}
              </ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>{t.password || "Password"}</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
              <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
                {t.passwordRequirements || "At least 8 characters with 1 digit"}
              </ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t.confirmPassword || "Confirm Password"}
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe
                      ? METUColors.actionGreen
                      : theme.backgroundDefault,
                    borderColor: rememberMe ? METUColors.actionGreen : theme.border,
                  },
                ]}
              >
                {rememberMe && <Feather name="check" size={16} color="#FFFFFF" />}
              </View>
              <ThemedText style={styles.rememberMeText}>
                {t.rememberMe || "Remember Me"}
              </ThemedText>
            </Pressable>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color={METUColors.alertRed} />
                <ThemedText style={[styles.errorText, { color: METUColors.alertRed }]}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                {
                  backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
                  opacity: pressed || loading ? 0.8 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.registerButtonText}>
                  {t.signUp || "Sign Up"}
                </ThemedText>
              )}
            </Pressable>

            <View style={styles.footer}>
              <ThemedText style={{ color: theme.textSecondary }}>
                {t.alreadyHaveAccount || "Already have an account?"}{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <ThemedText
                  style={{
                    color: isDark ? "#FF6B6B" : METUColors.maroon,
                    fontWeight: "600",
                  }}
                >
                  {t.signIn || "Sign In"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
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
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  successContent: {
    flex: 1,
    padding: Spacing["2xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  successTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  successMessage: {
    fontSize: Typography.body.fontSize,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  resendButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.sm,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
});
