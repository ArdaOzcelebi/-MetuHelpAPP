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
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.enterEmailAndPassword || "Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn(email, password, rememberMe);
      // Navigation will be handled by App.tsx based on auth state
    } catch (err: any) {
      setError(err.message);
      
      // If email not verified, show option to resend
      if (err.message.includes("verify your email")) {
        Alert.alert(
          t.emailNotVerified || "Email Not Verified",
          err.message,
          [
            { text: t.cancel || "Cancel", style: "cancel" },
            {
              text: t.resendVerification || "Resend Verification",
              onPress: () => navigation.navigate("Register"),
            },
          ],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="h2" style={styles.title}>
            {t.welcomeBack || "Welcome Back"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t.signInToContinue || "Sign in to continue"}
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
              {rememberMe && (
                <Feather name="check" size={16} color="#FFFFFF" />
              )}
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
              styles.loginButton,
              {
                backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
                opacity: pressed || loading ? 0.8 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.loginButtonText}>
                {t.signIn || "Sign In"}
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.footer}>
            <ThemedText style={{ color: theme.textSecondary }}>
              {t.dontHaveAccount || "Don't have an account?"}{" "}
            </ThemedText>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <ThemedText
                style={{
                  color: isDark ? "#FF6B6B" : METUColors.maroon,
                  fontWeight: "600",
                }}
              >
                {t.signUp || "Sign Up"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing["2xl"],
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
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  loginButtonText: {
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
});
