import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ConfirmationModal } from "@/src/components/ConfirmationModal";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatOverlay } from "@/src/contexts/ChatOverlayContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  subscribeToHelpRequests,
  finalizeHelpRequest,
} from "@/src/services/helpRequestService";
import { getChatByRequestId } from "@/src/services/chatService";
import type { HelpRequest, HelpRequestCategory } from "@/src/types/helpRequest";

type NeedHelpScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "NeedHelp">;
};

/**
 * Calculate time difference from now
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterChipProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, icon, isSelected, onPress }: FilterChipProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? isDark
              ? "#CC3333"
              : METUColors.maroon
            : theme.backgroundDefault,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={isSelected ? "#FFFFFF" : theme.text}
        style={styles.chipIcon}
      />
      <ThemedText
        style={[
          styles.chipText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface RequestCardProps {
  title: string;
  description: string;
  category: string;
  location: string;
  time: string;
  urgent: boolean;
  status: string;
  urgentLabel: string;
  helpButtonLabel: string;
  statusOpenLabel: string;
  statusAcceptedLabel: string;
  statusFinalizedLabel: string;
  onPress: () => void;
  onHelp: () => void;
  isOwnRequest?: boolean;
  hasActiveChat?: boolean;
  userHasOfferedHelp?: boolean;
  openChatLabel?: string;
  resumeChatLabel?: string;
  onOpenChat?: () => void;
  onMarkComplete?: () => void;
  isBeingHelped?: boolean;
}

function RequestCard({
  title,
  description,
  category,
  location,
  time,
  urgent,
  status,
  urgentLabel,
  helpButtonLabel,
  statusOpenLabel,
  statusAcceptedLabel,
  statusFinalizedLabel,
  onPress,
  onHelp,
  isOwnRequest = false,
  hasActiveChat = false,
  userHasOfferedHelp = false,
  openChatLabel = "Open Chat",
  resumeChatLabel = "Resume Chat",
  onOpenChat,
  onMarkComplete,
  isBeingHelped = false,
}: RequestCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    switch (category) {
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

  const getStatusBadge = () => {
    if (status === "finalized") {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: METUColors.actionGreen },
          ]}
        >
          <Feather name="check-circle" size={10} color="#FFFFFF" />
          <ThemedText style={styles.statusBadgeText}>
            {statusFinalizedLabel}
          </ThemedText>
        </View>
      );
    }
    if (status === "accepted") {
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#3B82F6" }]}>
          <Feather name="user-check" size={10} color="#FFFFFF" />
          <ThemedText style={styles.statusBadgeText}>
            {statusAcceptedLabel}
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.requestCard,
        {
          backgroundColor: theme.cardBackground,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 3,
        },
        // Add amber border if request is being helped but not yet completed
        isBeingHelped && {
          borderWidth: 2,
          borderColor: "#F59E0B", // Amber color
        },
        animatedStyle,
      ]}
    >
      {/* Header with icon and title */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: urgent
                ? "rgba(220, 38, 38, 0.1)"
                : isDark
                  ? "rgba(255, 107, 107, 0.15)"
                  : "rgba(128, 0, 0, 0.1)",
            },
          ]}
        >
          <Feather
            name={getCategoryIcon()}
            size={24}
            color={
              urgent
                ? METUColors.alertRed
                : isDark
                  ? "#FF6B6B"
                  : METUColors.maroon
            }
          />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.requestTitle} numberOfLines={1}>
            {title}
          </ThemedText>
          <View style={styles.badgeRow}>
            {getStatusBadge()}
            {urgent && status === "active" && (
              <View style={styles.urgentBadge}>
                <ThemedText style={styles.urgentText}>{urgentLabel}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Body with location and description */}
      <View style={styles.cardBody}>
        <View style={styles.requestMeta}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText
            style={[styles.requestLocation, { color: theme.textSecondary }]}
          >
            {location}
          </ThemedText>
        </View>
        {description && (
          <ThemedText
            style={[styles.requestDescription, { color: theme.textSecondary }]}
            numberOfLines={3}
          >
            {description}
          </ThemedText>
        )}
        <ThemedText
          style={[styles.requestTime, { color: theme.textSecondary }]}
        >
          {time} ago
        </ThemedText>
      </View>

      {/* Footer with action buttons */}
      <View style={styles.cardFooter}>
        {/* Show appropriate button based on user relationship to request */}
        {isOwnRequest ? (
          // User is the requester
          <>
            {hasActiveChat ? (
              // Chat exists - show "Open Chat" button
              <Pressable
                onPress={onOpenChat}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: METUColors.maroon,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="message-circle" size={16} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>
                  {openChatLabel}
                </ThemedText>
              </Pressable>
            ) : (
              // No chat yet - show "Waiting for Help" badge
              <View
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <ThemedText
                  style={[styles.waitingText, { color: theme.textSecondary }]}
                >
                  Waiting for Help...
                </ThemedText>
              </View>
            )}
            {/* Show "Mark as Completed" button only if request is accepted and user is the requester */}
            {status === "accepted" && onMarkComplete && (
              <Pressable
                onPress={onMarkComplete}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.secondaryButton,
                  {
                    backgroundColor: METUColors.actionGreen,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="check-circle" size={16} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>
                  Mark Complete
                </ThemedText>
              </Pressable>
            )}
          </>
        ) : (
          // User is not the requester
          <>
            {userHasOfferedHelp ? (
              // User has already offered help - show "Resume Chat"
              <Pressable
                onPress={onOpenChat}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: "#3B82F6",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="message-circle" size={16} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>
                  {resumeChatLabel}
                </ThemedText>
              </Pressable>
            ) : isBeingHelped ? (
              // Someone else is already helping - show disabled "Being Helped" button
              <View
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Feather
                  name="user-check"
                  size={16}
                  color={theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.actionButtonText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Being Helped
                </ThemedText>
              </View>
            ) : status === "active" ? (
              // User hasn't helped yet and request is still active - show "Offer Help"
              <Pressable
                onPress={onHelp}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: METUColors.actionGreen,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="heart" size={16} color="#FFFFFF" />
                <ThemedText style={styles.actionButtonText}>
                  {helpButtonLabel}
                </ThemedText>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

export default function NeedHelpScreen({ navigation }: NeedHelpScreenProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openChat } = useChatOverlay();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatsMap, setChatsMap] = useState<Map<string, string>>(new Map());
  const [userOfferedHelpMap, setUserOfferedHelpMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const checkActiveChats = useCallback(
    async (requests: HelpRequest[]) => {
      if (!user) return;

      const newChatsMap = new Map<string, string>();
      const newUserOfferedHelpMap = new Map<string, boolean>();

      for (const request of requests) {
        try {
          const chat = await getChatByRequestId(request.id, user.uid);
          if (chat) {
            newChatsMap.set(request.id, chat.id);

            if (chat.helperId === user.uid) {
              newUserOfferedHelpMap.set(request.id, true);
            }
          }
        } catch (error) {
          console.error(
            "[NeedHelpScreen] Error checking chat for request:",
            request.id,
            error,
          );
        }
      }

      setChatsMap(newChatsMap);
      setUserOfferedHelpMap(newUserOfferedHelpMap);
    },
    [user],
  );

  const handleMarkComplete = (requestId: string, requestTitle: string) => {
    setSelectedRequest({ id: requestId, title: requestTitle });
    setShowConfirmModal(true);
  };

  const performFinalization = async () => {
    if (!selectedRequest) return;

    setShowConfirmModal(false);

    try {
      await finalizeHelpRequest(selectedRequest.id);
    } catch (error) {
      console.error("[NeedHelpScreen] Error finalizing request:", error);
    } finally {
      setSelectedRequest(null);
    }
  };

  useEffect(() => {
    setLoading(true);

    const categoryFilter =
      selectedCategory === "all"
        ? undefined
        : (selectedCategory as HelpRequestCategory);

    const unsubscribe = subscribeToHelpRequests((requests) => {
      setHelpRequests(requests);
      setLoading(false);

      if (user) {
        checkActiveChats(requests);
      }
    }, categoryFilter);

    return () => {
      unsubscribe();
    };
  }, [selectedCategory, user, checkActiveChats]);

  const CATEGORIES = [
    { id: "all", label: t.all, icon: "grid" },
    { id: "medical", label: t.medical, icon: "activity" },
    { id: "academic", label: t.academic, icon: "book" },
    { id: "transport", label: t.transport, icon: "navigation" },
    { id: "other", label: t.other, icon: "help-circle" },
  ] as const;

  const filteredRequests =
    selectedCategory === "all"
      ? helpRequests
      : helpRequests.filter((req) => req.category === selectedCategory);

  return (
    <ScreenScrollView>
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        title="Mark as Completed"
        message={`Are you sure you want to mark "${selectedRequest?.title || "this request"}" as completed? This will finalize the request and archive it.`}
        confirmText="Mark Complete"
        cancelText="Cancel"
        onConfirm={performFinalization}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedRequest(null);
        }}
        confirmColor={METUColors.actionGreen}
        icon="check-circle"
      />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon as keyof typeof Feather.glyphMap}
              isSelected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.requestsList}>
        {loading ? (
          <ThemedText style={{ textAlign: "center", marginTop: Spacing.xl }}>
            Loading requests...
          </ThemedText>
        ) : filteredRequests.length === 0 ? (
          <ThemedText style={{ textAlign: "center", marginTop: Spacing.xl }}>
            No active requests found
          </ThemedText>
        ) : (
          filteredRequests.map((request) => {
            const isOwnRequest = user?.uid === request.userId;
            const chatId = chatsMap.get(request.id);
            const hasActiveChat = !!chatId;
            const userHasOfferedHelp =
              userOfferedHelpMap.get(request.id) || false;

            // Check if request is being helped by someone else
            // A request is "being helped" if acceptedBy is set and status is 'active'
            const isBeingHelped = !!(
              request.acceptedBy &&
              request.status === "active" &&
              request.acceptedBy !== user?.uid
            );

            return (
              <RequestCard
                key={request.id}
                title={request.title}
                description={request.description}
                category={request.category}
                location={request.location}
                time={getTimeAgo(request.createdAt)}
                urgent={request.urgent}
                status={request.status}
                urgentLabel={t.urgent}
                helpButtonLabel={t.iCanHelp}
                statusOpenLabel={t.statusOpen}
                statusAcceptedLabel={t.statusAccepted}
                statusFinalizedLabel={t.statusFinalized}
                isOwnRequest={isOwnRequest}
                hasActiveChat={hasActiveChat}
                userHasOfferedHelp={userHasOfferedHelp}
                isBeingHelped={isBeingHelped}
                openChatLabel="Open Chat"
                resumeChatLabel="Resume Chat"
                onPress={() =>
                  navigation.navigate("RequestDetail", {
                    requestId: request.id,
                  })
                }
                onHelp={() => {
                  navigation.navigate("RequestDetail", {
                    requestId: request.id,
                  });
                }}
                onOpenChat={() => {
                  if (chatId) {
                    openChat(chatId);
                  }
                }}
                onMarkComplete={
                  isOwnRequest && request.status === "accepted"
                    ? () => handleMarkComplete(request.id, request.title)
                    : undefined
                }
              />
            );
          })
        )}
      </View>

      <Pressable
        onPress={() => navigation.navigate("PostNeed")}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.xl,
  },
  filtersScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  requestsList: {
    gap: Spacing.md,
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  urgentBadge: {
    backgroundColor: METUColors.alertRed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  cardBody: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  requestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  requestLocation: {
    fontSize: 14,
    fontWeight: "500",
  },
  requestDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  requestTime: {
    fontSize: 12,
    fontWeight: "400",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  primaryButton: {
    minWidth: 120,
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  waitingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: Spacing["6xl"],
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
