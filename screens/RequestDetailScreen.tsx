import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getHelpRequest } from "@/src/services/helpRequestService";
import type { HelpRequest } from "@/src/types/helpRequest";

type RequestDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "RequestDetail">;
  route: RouteProp<HomeStackParamList, "RequestDetail">;
};

const REQUEST_DATA: Record<
  string,
  {
    id: string;
    title: string;
    category: string;
    location: string;
    time: string;
    urgent: boolean;
    description: string;
    posterName: string;
    posterInitials: string;
  }
> = {
  "1": {
    id: "1",
    title: "Need 1 Bandage",
    category: "medical",
    location: "Near Library",
    time: "5 min ago",
    urgent: true,
    description:
      "Cut my finger while studying. Nothing serious but I need a bandage to stop the bleeding. Will be at the library entrance.",
    posterName: "Ahmet Y.",
    posterInitials: "AY",
  },
  "2": {
    id: "2",
    title: "Need Pain Reliever",
    category: "medical",
    location: "Engineering Building",
    time: "12 min ago",
    urgent: true,
    description:
      "Having a bad headache before my exam. Would appreciate any pain reliever. I'm in room B-104.",
    posterName: "Zeynep K.",
    posterInitials: "ZK",
  },
  "3": {
    id: "3",
    title: "Need a Phone Charger (USB-C)",
    category: "other",
    location: "Student Center",
    time: "18 min ago",
    urgent: false,
    description:
      "My phone is at 2% and I need to call my family. Looking for a USB-C charger I can borrow for 30 minutes.",
    posterName: "Mehmet A.",
    posterInitials: "MA",
  },
  "4": {
    id: "4",
    title: "Looking for Ride to Kizilay",
    category: "transport",
    location: "Main Gate",
    time: "25 min ago",
    urgent: false,
    description:
      "Need to get to Kizilay for a doctor appointment at 4 PM. Can share gas costs. Will be at the main gate.",
    posterName: "Elif S.",
    posterInitials: "ES",
  },
  "5": {
    id: "5",
    title: "Need Calculator for Exam",
    category: "academic",
    location: "Physics Building",
    time: "32 min ago",
    urgent: true,
    description:
      "Forgot my calculator and have a physics exam in 30 minutes! Need a scientific calculator urgently.",
    posterName: "Can B.",
    posterInitials: "CB",
  },
};

/**
 * Calculate time difference from now
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

/**
 * Get user initials from name or email
 */
function getUserInitials(name: string, email: string): string {
  if (name && name !== "Anonymous") {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function RequestDetailScreen({
  navigation,
  route,
}: RequestDetailScreenProps) {
  const { theme, isDark } = useTheme();
  const { requestId } = route.params;
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await getHelpRequest(requestId);
        setRequest(data);
      } catch (error) {
        console.error("Error loading request:", error);
        Alert.alert("Error", "Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [requestId]);

  if (loading) {
    return (
      <ScreenScrollView>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: Spacing.xl }}>
          <ActivityIndicator size="large" color={METUColors.maroon} />
        </View>
      </ScreenScrollView>
    );
  }

  if (!request) {
    return (
      <ScreenScrollView>
        <ThemedText style={{ textAlign: "center", marginTop: Spacing.xl }}>
          Request not found
        </ThemedText>
      </ScreenScrollView>
    );
  }

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    switch (request.category) {
      case "medical":
        return "activity";
      case "academic":
        return "book";
      case "transport":
        return "navigation";
      default:
        return "help-circle";
    }
  };

  const getCategoryLabel = () => {
    switch (request.category) {
      case "medical":
        return "Medical";
      case "academic":
        return "Academic";
      case "transport":
        return "Transport";
      default:
        return "Other";
    }
  };

  const handleOfferHelp = () => {
    if (hasOfferedHelp) {
      Alert.alert(
        "Already Offered",
        "You've already offered to help with this request.",
        [{ text: "OK" }],
      );
      return;
    }
    setHasOfferedHelp(true);
    Alert.alert(
      "Help Offered!",
      `Thank you for offering to help ${request.userName}! They will be notified.`,
      [{ text: "OK" }],
    );
  };

  const posterInitials = getUserInitials(request.userName, request.userEmail);

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <View style={styles.posterInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {posterInitials}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.posterName}>
              {request.userName}
            </ThemedText>
            <ThemedText
              style={[styles.postTime, { color: theme.textSecondary }]}
            >
              Posted {getTimeAgo(request.createdAt)}
            </ThemedText>
          </View>
        </View>
        {request.urgent ? (
          <View style={styles.urgentBadge}>
            <Feather name="alert-circle" size={14} color="#FFFFFF" />
            <ThemedText style={styles.urgentText}>Urgent</ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText type="h3" style={styles.title}>
        {request.title}
      </ThemedText>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather
            name={getCategoryIcon()}
            size={16}
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText style={styles.categoryText}>
            {getCategoryLabel()}
          </ThemedText>
        </View>

        <View style={styles.locationBadge}>
          <Feather name="map-pin" size={16} color={theme.textSecondary} />
          <ThemedText
            style={[styles.locationText, { color: theme.textSecondary }]}
          >
            {request.location}
          </ThemedText>
        </View>
      </View>

      <View
        style={[
          styles.descriptionCard,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <ThemedText style={styles.descriptionLabel}>Details</ThemedText>
        <ThemedText style={styles.descriptionText}>
          {request.description}
        </ThemedText>
      </View>

      <Pressable
        onPress={handleOfferHelp}
        style={({ pressed }) => [
          styles.helpButton,
          {
            backgroundColor: hasOfferedHelp
              ? theme.backgroundSecondary
              : METUColors.actionGreen,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather
          name={hasOfferedHelp ? "check" : "heart"}
          size={20}
          color={hasOfferedHelp ? theme.text : "#FFFFFF"}
        />
        <ThemedText
          style={[
            styles.helpButtonText,
            { color: hasOfferedHelp ? theme.text : "#FFFFFF" },
          ]}
        >
          {hasOfferedHelp ? "Help Offered" : "I Can Help"}
        </ThemedText>
      </Pressable>

      <View style={styles.contactNote}>
        <Feather name="info" size={16} color={theme.textSecondary} />
        <ThemedText
          style={[styles.contactNoteText, { color: theme.textSecondary }]}
        >
          When you offer help, the poster will be notified and can contact you
          directly.
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  posterInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  posterName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  postTime: {
    fontSize: Typography.small.fontSize,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: METUColors.alertRed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  urgentText: {
    color: "#FFFFFF",
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  title: {
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.small.fontSize,
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  descriptionLabel: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  descriptionText: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  helpButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
  contactNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: BorderRadius.md,
  },
  contactNoteText: {
    flex: 1,
    fontSize: Typography.small.fontSize,
    lineHeight: 20,
  },
});
