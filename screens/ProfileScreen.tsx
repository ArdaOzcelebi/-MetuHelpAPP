import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import {
  subscribeToUserStats,
  getRecentActivity,
  type UserStats,
  type RecentActivityItem,
} from "@/src/services/profileStatsService";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

// Display only first 5 activities for better UX, even though service fetches 10
const MAX_DISPLAYED_ACTIVITIES = 5;

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    requestsPosted: 0,
    helpGiven: 0,
    questionsAsked: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    [],
  );
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Subscribe to real-time user stats
  useEffect(() => {
    if (!user?.uid) return;

    console.log(
      "[ProfileScreen] Setting up stats subscription for user:",
      user.uid,
    );
    const unsubscribe = subscribeToUserStats(user.uid, (stats) => {
      console.log("[ProfileScreen] Received stats update:", stats);
      setUserStats(stats);
    });

    return () => {
      console.log("[ProfileScreen] Cleaning up stats subscription");
      unsubscribe();
    };
  }, [user?.uid]);

  // Load recent activity
  useEffect(() => {
    if (!user?.uid) return;

    console.log("[ProfileScreen] Loading recent activity");
    setLoadingActivity(true);
    getRecentActivity(user.uid)
      .then((activity) => {
        console.log("[ProfileScreen] Loaded activity:", activity.length);
        setRecentActivity(activity);
      })
      .catch((error) => {
        console.error("[ProfileScreen] Failed to load activity:", error);
      })
      .finally(() => {
        setLoadingActivity(false);
      });
  }, [user?.uid]);

  const handleLogout = () => {
    console.log("[ProfileScreen] Logout button pressed");

    // Web platform doesn't support Alert.alert, use window.confirm instead
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm(`${t.logOut}\n\n${t.logOutConfirm}`);
        if (confirmed) {
          console.log("[ProfileScreen] User confirmed logout");
          performLogout();
        }
      }
    } else {
      Alert.alert(t.logOut, t.logOutConfirm, [
        { text: t.cancel, style: "cancel" },
        {
          text: t.logOut,
          style: "destructive",
          onPress: async () => {
            console.log("[ProfileScreen] User confirmed logout");
            performLogout();
          },
        },
      ]);
    }
  };

  const performLogout = async () => {
    try {
      await signOut();
      console.log("[ProfileScreen] SignOut completed successfully");
      // Navigation to login will be handled by App.tsx
    } catch (error: any) {
      console.error("[ProfileScreen] SignOut failed:", error);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(`${t.error}\n\n${error.message || t.logoutFailed}`);
      } else {
        Alert.alert(t.error, error.message || t.logoutFailed);
      }
    }
  };

  const getInitials = () => {
    if (!user?.email) return "ME";
    const email = user.email;
    const username = email.split("@")[0];
    return username.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const username = user.email.split("@")[0];
      // Replace dots with spaces and capitalize each word
      return username
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return "METU Student";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "request":
        return "heart";
      case "help":
        return "users";
      case "question":
        return "message-circle";
      default:
        return "activity";
    }
  };

  const formatActivityTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
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
          <ThemedText style={styles.avatarText}>{getInitials()}</ThemedText>
        </View>
        <ThemedText type="h3" style={styles.userName}>
          {getUserName()}
        </ThemedText>
        <ThemedText style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email || "student@metu.edu.tr"}
        </ThemedText>
        {user?.emailVerified && (
          <View style={styles.verifiedBadge}>
            <Feather
              name="check-circle"
              size={16}
              color={METUColors.actionGreen}
            />
            <ThemedText
              style={[styles.verifiedText, { color: METUColors.actionGreen }]}
            >
              {t.emailVerified}
            </ThemedText>
          </View>
        )}
        {user?.metadata?.creationTime && (
          <ThemedText
            style={[styles.memberSinceText, { color: theme.textSecondary }]}
          >
            {t.memberSince} {formatDate(new Date(user.metadata.creationTime))}
          </ThemedText>
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
          <ThemedText style={styles.statNumber}>
            {userStats.requestsPosted}
          </ThemedText>
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
          <ThemedText style={styles.statNumber}>
            {userStats.helpGiven}
          </ThemedText>
          <ThemedText
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.helpGiven}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="message-circle" size={20} color="#3B82F6" />
          <ThemedText style={styles.statNumber}>
            {userStats.questionsAsked}
          </ThemedText>
          <ThemedText
            style={[styles.statLabel, { color: theme.textSecondary }]}
          >
            {t.questionsAsked}
          </ThemedText>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t.recentActivity}</ThemedText>
        <View
          style={[
            styles.activityCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          {loadingActivity ? (
            <View style={styles.activityLoading}>
              <ActivityIndicator
                size="small"
                color={isDark ? METUColors.maroon : METUColors.maroon}
              />
            </View>
          ) : recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Feather
                name="activity"
                size={32}
                color={theme.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                {t.noRecentActivity}
              </ThemedText>
            </View>
          ) : (
            recentActivity
              .slice(0, MAX_DISPLAYED_ACTIVITIES)
              .map((activity, index) => (
                <View key={activity.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.activityRow}>
                    <View
                      style={[
                        styles.activityIconContainer,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <Feather
                        name={getActivityIcon(activity.type)}
                        size={16}
                        color={theme.text}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <ThemedText
                        style={styles.activityTitle}
                        numberOfLines={1}
                      >
                        {activity.title}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.activityTime,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {formatActivityTime(activity.timestamp)}
                      </ThemedText>
                    </View>
                    {activity.status && (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              activity.status === "active"
                                ? "rgba(16, 185, 129, 0.1)"
                                : activity.status === "finalized"
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(128, 128, 128, 0.1)",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.statusText,
                            {
                              color:
                                activity.status === "active"
                                  ? METUColors.actionGreen
                                  : activity.status === "finalized"
                                    ? "#3B82F6"
                                    : theme.textSecondary,
                            },
                          ]}
                        >
                          {activity.status}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t.settings}</ThemedText>
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
        testID="logout-button"
        onPress={handleLogout}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    marginTop: Spacing.xs,
  },
  verifiedText: {
    fontSize: Typography.caption.fontSize,
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
  memberSinceText: {
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
  },
  activityCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  activityLoading: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActivity: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.body.fontSize,
    marginBottom: Spacing.xs / 2,
  },
  activityTime: {
    fontSize: Typography.caption.fontSize,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
