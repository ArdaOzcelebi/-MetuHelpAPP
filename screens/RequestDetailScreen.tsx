import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatOverlay } from "@/src/contexts/ChatOverlayContext";
import { ConfirmationModal } from "@/src/components/ConfirmationModal";
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
  deleteHelpRequest,
} from "@/src/services/helpRequestService";
import {
  createChat,
  getChatByRequestId,
  sendSystemMessage,
} from "@/src/services/chatService";
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
  const { openChat } = useChatOverlay();
  const { requestId } = route.params;
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [offeringHelp, setOfferingHelp] = useState(false);
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set up header right button for delete action
  useLayoutEffect(() => {
    // Determine if delete button should be shown
    const isOwnRequest = user?.uid === request?.userId;
    const isAccepted = request?.status === "accepted";
    const isFinalized = request?.status === "finalized";
    const showDelete = isOwnRequest && !isAccepted && !isFinalized;

    if (showDelete) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={{
              marginRight: 8,
              padding: 8,
            }}
          >
            <Feather name="trash-2" size={22} color={METUColors.alertRed} />
          </TouchableOpacity>
        ),
      });
    } else {
      // Clear the header button if conditions not met
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [navigation, request, user]);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await getHelpRequest(requestId);
        setRequest(data);

        // Check if user has already offered help (chat exists)
        if (user && data) {
          const existingChat = await getChatByRequestId(requestId, user.uid);
          if (existingChat && existingChat.helperId === user.uid) {
            setHasOfferedHelp(true);
          }
        }
      } catch (error) {
        console.error("Error loading request:", error);
        Alert.alert("Error", "Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [requestId, user]);

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

  const handleOfferHelp = async () => {
    if (!user || !request) {
      Alert.alert("Error", "Unable to offer help at this time.");
      return;
    }

    if (hasOfferedHelp) {
      Alert.alert(
        "Already Offered",
        "You've already offered to help with this request.",
        [{ text: "OK" }],
      );
      return;
    }

    // Check if user is trying to help their own request
    if (request.userId === user.uid) {
      Alert.alert("Cannot Help", "You cannot offer help on your own request.", [
        { text: "OK" },
      ]);
      return;
    }

    setOfferingHelp(true);

    try {
      // Check if a chat already exists
      const existingChat = await getChatByRequestId(requestId, user.uid);

      let chatId: string;

      if (existingChat) {
        // Chat already exists
        chatId = existingChat.id;
        console.log("[RequestDetailScreen] Using existing chat:", chatId);

        // IMPORTANT: Check if the current user is the helper in this chat
        // If someone else is the helper, prevent this user from accepting
        if (existingChat.helperId !== user.uid) {
          console.log(
            "[RequestDetailScreen] Chat already exists with different helper:",
            existingChat.helperId,
          );
          Alert.alert(
            "Already Accepted",
            "This request has already been accepted by another user.",
            [{ text: "OK" }],
          );
          setOfferingHelp(false);
          return;
        }

        // User is the helper, check if request needs to be accepted (status might still be "active")
        if (request.status === "active") {
          console.log("[RequestDetailScreen] Accepting existing request");
          await acceptHelpRequest(
            requestId,
            user.uid,
            user.displayName || user.email || "Helper",
            user.email || "",
            chatId,
          );
          console.log("[RequestDetailScreen] Request accepted successfully");
        }
      } else {
        // Create a new chat
        console.log(
          "[RequestDetailScreen] Creating new chat for request:",
          requestId,
        );
        chatId = await createChat({
          requestId: request.id,
          requestTitle: request.title,
          requesterId: request.userId,
          requesterName: request.userName,
          requesterEmail: request.userEmail,
          helperId: user.uid,
          helperName: user.displayName || user.email || "Helper",
          helperEmail: user.email || "",
        });
        console.log("[RequestDetailScreen] Chat created successfully:", chatId);

        // Send initial system message
        await sendSystemMessage(
          chatId,
          "Chat started! Please coordinate the meeting point here.",
        );
        console.log("[RequestDetailScreen] System message sent successfully");

        // Accept the request (update status to "accepted")
        await acceptHelpRequest(
          requestId,
          user.uid,
          user.displayName || user.email || "Helper",
          user.email || "",
          chatId,
        );
        console.log("[RequestDetailScreen] Request accepted successfully");
      }

      setHasOfferedHelp(true);

      // Open chat in the global overlay instead of navigating
      console.log("[RequestDetailScreen] Opening chat via overlay:", chatId);
      openChat(chatId);
    } catch (error) {
      console.error("[RequestDetailScreen] Error offering help:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setOfferingHelp(false);
    }
  };

  // Handler to open chat via overlay
  const handleOpenChat = async () => {
    if (!request?.chatId) {
      console.warn("[RequestDetail] No chat ID available");
      return;
    }

    console.log("[RequestDetail] Opening chat via overlay:", request.chatId);
    openChat(request.chatId);
  };

  const handleDeleteRequest = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setShowDeleteModal(false); // Close modal immediately to prevent double-clicks
    
    try {
      await deleteHelpRequest(requestId);
      Alert.alert(t.requestDeleted, t.requestDeletedMessage, [
        {
          text: t.ok,
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.failedToDeleteRequest,
      );
      setIsDeleting(false); // Reset flag on error so user can retry
    }
    // Note: Don't reset isDeleting on success - we're navigating away anyway
  };

  const posterInitials = getUserInitials(request.userName, request.userEmail);
  const displayName = request.isAnonymous ? "Anonymous" : request.userName;
  const displayInitials = request.isAnonymous ? "AN" : posterInitials;

  // Determine button state and action
  const isOwnRequest = user?.uid === request.userId;
  const isAccepted = request.status === "accepted";
  const isFinalized = request.status === "finalized";
  const canViewChat =
    (isOwnRequest || user?.uid === request.acceptedBy) &&
    (isAccepted || isFinalized) &&
    request.chatId;

  console.log("[RequestDetail] Button state:", {
    isOwnRequest,
    isAccepted,
    isFinalized,
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

      {/* Only show "I Can Help" button if user is not the requester */}
      {user && request.userId !== user.uid && (
        <Pressable
          onPress={handleOfferHelp}
          disabled={offeringHelp}
          style={({ pressed }) => [
            styles.helpButton,
            {
              backgroundColor: hasOfferedHelp
                ? theme.backgroundSecondary
                : METUColors.actionGreen,
              opacity: pressed || offeringHelp ? 0.9 : 1,
            },
          ]}
        >
          {offeringHelp ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather
              name={hasOfferedHelp ? "check" : "heart"}
              size={20}
              color={hasOfferedHelp ? theme.text : "#FFFFFF"}
            />
          )}
          <ThemedText
            style={[
              styles.helpButtonText,
              { color: hasOfferedHelp ? theme.text : "#FFFFFF" },
            ]}
          >
            {hasOfferedHelp ? "Help Offered" : "I Can Help"}
          </ThemedText>
        </Pressable>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title={t.deleteRequestConfirm}
        message={t.deleteRequestConfirmMessage}
        confirmText={t.delete}
        cancelText={t.cancel}
        onConfirm={handleDeleteRequest}
        onCancel={() => setShowDeleteModal(false)}
        confirmColor={METUColors.alertRed}
        icon="trash-2"
      />
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
