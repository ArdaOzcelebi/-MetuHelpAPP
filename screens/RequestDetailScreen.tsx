import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

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
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  getHelpRequest,
  acceptHelpRequest,
} from "@/src/services/helpRequestService";
import { createChat } from "@/src/services/chatService";
import type { HelpRequest } from "@/src/types/helpRequest";

type RequestDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "RequestDetail">;
  route: RouteProp<HomeStackParamList, "RequestDetail">;
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
  const { t } = useLanguage();
  const { user } = useAuth();
  const { requestId } = route.params;
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  console.log("[RequestDetail] Component rendered, user:", user?.uid, "requestId:", requestId);

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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: Spacing.xl,
          }}
        >
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

  const handleAcceptRequest = async () => {
    console.log("[RequestDetail] handleAcceptRequest called");
    
    if (!user || !request) {
      console.log("[RequestDetail] Cannot accept: user or request is null", {
        hasUser: !!user,
        hasRequest: !!request,
      });
      return;
    }

    console.log("[RequestDetail] Validation checks...", {
      userUid: user.uid,
      requestUserId: request.userId,
      requestStatus: request.status,
    });

    // Check if user is trying to accept their own request
    if (user.uid === request.userId) {
      console.log("[RequestDetail] User is trying to accept own request");
      Alert.alert(t.error, t.cannotAcceptOwnRequest);
      return;
    }

    // Check if request is already accepted
    if (request.status === "accepted" || request.status === "finalized") {
      console.log("[RequestDetail] Request already accepted/finalized");
      Alert.alert(t.error, t.requestAlreadyAccepted);
      return;
    }

    console.log("[RequestDetail] Showing confirmation dialog...");
    
    // For web compatibility: use window.confirm instead of Alert.alert with buttons
    if (typeof window !== "undefined" && window.confirm) {
      const confirmed = window.confirm(
        `${t.acceptConfirm}\n\n${t.acceptConfirmMessage}`,
      );
      
      if (!confirmed) {
        console.log("[RequestDetail] User cancelled acceptance");
        return;
      }
      
      console.log("[RequestDetail] User confirmed, proceeding with acceptance");
      setAccepting(true);
      
      try {
        console.log("[RequestDetail] Creating chat for request:", request.id);

        // Create chat first
        const chatId = await createChat({
          requestId: request.id,
          requestTitle: request.title,
          requesterId: request.userId,
          requesterName: request.userName,
          requesterEmail: request.userEmail,
          accepterId: user.uid,
          accepterName: user.displayName || user.email || "Unknown",
          accepterEmail: user.email || "",
        });

        console.log("[RequestDetail] Chat created with ID:", chatId);

        // Update the help request with acceptance info
        await acceptHelpRequest(
          request.id,
          user.uid,
          user.displayName || user.email || "Unknown",
          user.email || "",
          chatId,
        );

        console.log("[RequestDetail] Request accepted, navigating to chat");

        // Navigate directly to chat
        navigation.navigate("Chat", {
          chatId,
          requestId: request.id,
        });
      } catch (error) {
        console.error("[RequestDetail] Error accepting request:", error);
        // Show detailed error for debugging
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        alert(`${t.failedToAcceptRequest}\n\nDebug info: ${errorMessage}`);
      } finally {
        setAccepting(false);
      }
    } else {
      // Fallback for mobile: use Alert.alert
      Alert.alert(t.acceptConfirm, t.acceptConfirmMessage, [
        {
          text: t.cancel,
          style: "cancel",
          onPress: () => {
            console.log("[RequestDetail] User cancelled acceptance");
          },
        },
        {
          text: t.acceptRequest,
          onPress: async () => {
            console.log("[RequestDetail] User confirmed, proceeding with acceptance");
            setAccepting(true);
            try {
              console.log(
                "[RequestDetail] Creating chat for request:",
                request.id,
              );

              // Create chat first
              const chatId = await createChat({
                requestId: request.id,
                requestTitle: request.title,
                requesterId: request.userId,
                requesterName: request.userName,
                requesterEmail: request.userEmail,
                accepterId: user.uid,
                accepterName: user.displayName || user.email || "Unknown",
                accepterEmail: user.email || "",
              });

              console.log("[RequestDetail] Chat created with ID:", chatId);

              // Update the help request with acceptance info
              await acceptHelpRequest(
                request.id,
                user.uid,
                user.displayName || user.email || "Unknown",
                user.email || "",
                chatId,
              );

              console.log("[RequestDetail] Request accepted, navigating to chat");

              // Navigate directly to chat without showing intermediate alert
              navigation.navigate("Chat", {
                chatId,
                requestId: request.id,
              });
            } catch (error) {
              console.error("[RequestDetail] Error accepting request:", error);
              // Show detailed error for debugging
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              Alert.alert(
                t.error,
                `${t.failedToAcceptRequest}\n\nDebug info: ${errorMessage}`,
              );
            } finally {
              setAccepting(false);
            }
          },
        },
      ]);
    }
  };

  const handleOpenChat = async () => {
    if (!request || !request.chatId) return;

    navigation.navigate("Chat", {
      chatId: request.chatId,
      requestId: request.id,
    });
  };

  const posterInitials = getUserInitials(request.userName, request.userEmail);
  const displayName = request.isAnonymous ? "Anonymous" : request.userName;
  const displayInitials = request.isAnonymous ? "AN" : posterInitials;

  // Determine button state and action
  const isOwnRequest = user?.uid === request.userId;
  const isAccepted = request.status === "accepted";
  const isFinalized = request.status === "finalized";
  const canAccept = !isOwnRequest && request.status === "active";
  const canViewChat =
    (isOwnRequest || user?.uid === request.acceptedBy) &&
    (isAccepted || isFinalized) &&
    request.chatId;

  console.log("[RequestDetail] Button state:", {
    isOwnRequest,
    isAccepted,
    isFinalized,
    canAccept,
    canViewChat,
    status: request.status,
    userId: user?.uid,
    requestUserId: request.userId,
  });

  const getStatusBadge = () => {
    if (isFinalized) {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: METUColors.actionGreen },
          ]}
        >
          <Feather name="check-circle" size={14} color="#FFFFFF" />
          <ThemedText style={styles.statusBadgeText}>
            {t.statusFinalized}
          </ThemedText>
        </View>
      );
    }
    if (isAccepted) {
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#3B82F6" }]}>
          <Feather name="user-check" size={14} color="#FFFFFF" />
          <ThemedText style={styles.statusBadgeText}>
            {t.statusAccepted}
          </ThemedText>
        </View>
      );
    }
    return null;
  };

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
            <ThemedText style={styles.avatarText}>{displayInitials}</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.posterName}>{displayName}</ThemedText>
            <ThemedText
              style={[styles.postTime, { color: theme.textSecondary }]}
            >
              Posted {getTimeAgo(request.createdAt)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          {getStatusBadge()}
          {request.urgent && !isFinalized && !isAccepted ? (
            <View style={styles.urgentBadge}>
              <Feather name="alert-circle" size={14} color="#FFFFFF" />
              <ThemedText style={styles.urgentText}>{t.urgent}</ThemedText>
            </View>
          ) : null}
        </View>
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

      {isAccepted && request.acceptedByName && !isOwnRequest && (
        <View
          style={[
            styles.acceptedByCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Feather name="user-check" size={20} color={METUColors.actionGreen} />
          <View style={styles.acceptedByInfo}>
            <ThemedText style={styles.acceptedByLabel}>
              {t.acceptedBy}
            </ThemedText>
            <ThemedText style={styles.acceptedByName}>
              {request.acceptedByName}
            </ThemedText>
          </View>
        </View>
      )}

      {canViewChat ? (
        <Pressable
          onPress={handleOpenChat}
          style={({ pressed }) => [
            styles.helpButton,
            {
              backgroundColor: METUColors.maroon,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Feather name="message-circle" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.helpButtonText, { color: "#FFFFFF" }]}>
            {t.chat}
          </ThemedText>
        </Pressable>
      ) : canAccept ? (
        <Pressable
          onPress={() => {
            console.log("[RequestDetail] Accept button clicked!");
            handleAcceptRequest();
          }}
          disabled={accepting}
          style={({ pressed }) => [
            styles.helpButton,
            {
              backgroundColor: accepting
                ? theme.backgroundSecondary
                : METUColors.actionGreen,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {accepting ? (
            <>
              <ActivityIndicator size="small" color={theme.text} />
              <ThemedText
                style={[styles.helpButtonText, { color: theme.text }]}
              >
                {t.accepting}
              </ThemedText>
            </>
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFFFFF" />
              <ThemedText style={[styles.helpButtonText, { color: "#FFFFFF" }]}>
                {t.acceptRequest}
              </ThemedText>
            </>
          )}
        </Pressable>
      ) : isFinalized ? (
        <View style={styles.finalizedMessage}>
          <Feather
            name="check-circle"
            size={20}
            color={METUColors.actionGreen}
          />
          <ThemedText
            style={[
              styles.finalizedMessageText,
              { color: theme.textSecondary },
            ]}
          >
            {t.requestFinalizedStatus}
          </ThemedText>
        </View>
      ) : null}

      {canAccept && (
        <View style={styles.contactNote}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText
            style={[styles.contactNoteText, { color: theme.textSecondary }]}
          >
            {t.acceptConfirmMessage}
          </ThemedText>
        </View>
      )}
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
    flex: 1,
  },
  badgeContainer: {
    gap: Spacing.xs,
    alignItems: "flex-end",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
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
    marginBottom: Spacing.lg,
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
  acceptedByCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  acceptedByInfo: {
    flex: 1,
  },
  acceptedByLabel: {
    fontSize: Typography.small.fontSize,
    opacity: 0.7,
  },
  acceptedByName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    marginTop: Spacing.xs,
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
  finalizedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  finalizedMessageText: {
    fontSize: Typography.body.fontSize,
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
