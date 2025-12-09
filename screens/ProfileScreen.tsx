import React, { useState } from "react";
import { StyleSheet, View, Pressable, Switch, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleLogout = () => {
    Alert.alert(t.logOut, t.logOutConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.logOut,
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            Alert.alert(t.loggedOut, t.loggedOutMessage);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to log out");
          }
        },
      },
    ]);
  };

  return (
    <ScreenScrollView>
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
          ]}
        >
          <ThemedText style={styles.avatarText}>
            {user?.displayName
              ? user.displayName.substring(0, 2).toUpperCase()
              : "ME"}
          </ThemedText>
        </View>
        <ThemedText type="h3" style={styles.userName}>
          {user?.displayName || "METU Student"}
        </ThemedText>
        <ThemedText style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email || "student@metu.edu.tr"}
        </ThemedText>
        {user?.emailVerified && (
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={16} color={METUColors.actionGreen} />
            <ThemedText style={[styles.verifiedText, { color: METUColors.actionGreen }]}>
              {t.verified || "Verified"}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather
            name="heart"
            size={20}
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText style={styles.statNumber}>12</ThemedText>
          <ThemedText
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.requestsPosted}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="users" size={20} color={METUColors.actionGreen} />
          <ThemedText style={styles.statNumber}>28</ThemedText>
          <ThemedText
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.helpGiven}
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t.notifications}</ThemedText>
        <View
          style={[
            styles.settingCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={20} color={theme.text} />
              <ThemedText style={styles.settingLabel}>
                {t.pushNotifications}
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: theme.backgroundSecondary,
                true: METUColors.actionGreen,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="mail" size={20} color={theme.text} />
              <ThemedText style={styles.settingLabel}>
                {t.emailUpdates}
              </ThemedText>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{
                false: theme.backgroundSecondary,
                true: METUColors.actionGreen,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t.about}</ThemedText>
        <View
          style={[
            styles.settingCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather name="info" size={20} color={theme.text} />
              <ThemedText style={styles.settingLabel}>{t.aboutApp}</ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather name="shield" size={20} color={theme.text} />
              <ThemedText style={styles.settingLabel}>
                {t.privacyPolicy}
              </ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather name="file-text" size={20} color={theme.text} />
              <ThemedText style={styles.settingLabel}>
                {t.termsOfService}
              </ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Feather name="log-out" size={20} color={METUColors.alertRed} />
        <ThemedText style={[styles.logoutText, { color: METUColors.alertRed }]}>
          {t.logOut}
        </ThemedText>
      </Pressable>

      <ThemedText style={[styles.versionText, { color: theme.textSecondary }]}>
        METU Help v1.0.0
      </ThemedText>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.body.fontSize,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  verifiedText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.body.fontSize,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    marginHorizontal: Spacing.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoutText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  versionText: {
    fontSize: Typography.caption.fontSize,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
});
