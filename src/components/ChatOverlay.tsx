/**
 * ChatOverlay - Global floating chat widget component
 *
 * This component renders a floating chat widget that can be:
 * - Minimized as a FAB bubble with unread count badge
 * - Expanded as a chat window with thread list and conversation view
 *
 * The overlay is positioned absolutely and sits above all other content.
 * On mobile, it uses a bottom sheet/modal. On web, it's a bottom-right box.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatOverlay } from "@/src/contexts/ChatOverlayContext";
import {
  subscribeToMessages,
  sendMessage,
  getChat,
  finalizeChat,
} from "@/src/services/chatService";
import { finalizeHelpRequest } from "@/src/services/helpRequestService";
import type { Message, Chat } from "@/src/types/chat";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const OVERLAY_WIDTH = IS_WEB ? 300 : SCREEN_WIDTH * 0.9;
const OVERLAY_HEIGHT = IS_WEB ? 400 : SCREEN_HEIGHT * 0.7;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Minimized FAB bubble with unread badge
 */
function MinimizedBubble() {
  const { isDark } = useTheme();
  const { toggleMinimize, unreadCount } = useChatOverlay();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={toggleMinimize}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.bubble,
        {
          backgroundColor: isDark ? "#CC3333" : METUColors.maroon,
        },
        animatedStyle,
      ]}
    >
      <Feather name="message-circle" size={24} color="#FFFFFF" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

/**
 * Thread list item component
 */
interface ThreadItemProps {
  chat: Chat;
  onPress: () => void;
  currentUserId: string;
}

function ThreadItem({ chat, onPress, currentUserId }: ThreadItemProps) {
  const { theme } = useTheme();

  // Determine who the other person is
  const otherPersonName =
    currentUserId === chat.requesterId ? chat.helperName : chat.requesterName;

  const timeAgo = chat.lastMessageAt
    ? getTimeAgo(chat.lastMessageAt)
    : "No messages";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.threadItem,
        {
          backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
        },
      ]}
    >
      <View style={styles.threadIcon}>
        <Feather name="user" size={20} color={METUColors.maroon} />
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <ThemedText style={styles.threadTitle} numberOfLines={1}>
            {chat.requestTitle}
          </ThemedText>
          <ThemedText
            style={[styles.threadTime, { color: theme.textSecondary }]}
          >
            {timeAgo}
          </ThemedText>
        </View>
        <ThemedText style={styles.threadSubtitle} numberOfLines={1}>
          {otherPersonName}
        </ThemedText>
        {chat.lastMessage && (
          <ThemedText
            style={[styles.threadMessage, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

/**
 * Thread list view - shows all active chats (excludes finalized)
 */
function ThreadListView() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { chats, openChat } = useChatOverlay();

  if (!user) return null;

  // Filter out finalized chats - only show active chats
  const activeChats = chats.filter((chat) => chat.status !== "finalized");

  return (
    <View style={styles.threadListContainer}>
      {activeChats.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather
            name="message-circle"
            size={48}
            color={theme.textSecondary}
          />
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            No active chats yet
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={activeChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThreadItem
              chat={item}
              onPress={() => openChat(item.id)}
              currentUserId={user.uid}
            />
          )}
          contentContainerStyle={styles.threadList}
        />
      )}
    </View>
  );
}

/**
 * Message bubble component
 */
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isOwn
              ? isDark
                ? "#CC3333"
                : METUColors.maroon
              : theme.cardBackground,
          },
        ]}
      >
        {!isOwn && (
          <ThemedText
            style={[
              styles.senderName,
              { color: isDark ? "#FF6B6B" : METUColors.maroon },
            ]}
          >
            {message.senderName}
          </ThemedText>
        )}
        <ThemedText
          style={[
            styles.messageText,
            { color: isOwn ? "#FFFFFF" : theme.text },
          ]}
        >
          {message.text}
        </ThemedText>
        <ThemedText
          style={[
            styles.messageTime,
            {
              color: isOwn ? "rgba(255, 255, 255, 0.7)" : theme.textSecondary,
            },
          ]}
        >
          {formatMessageTime(message.createdAt)}
        </ThemedText>
      </View>
    </View>
  );
}

/**
 * Conversation view - shows messages for a specific chat
 */
function ConversationView() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { activeChatId, goBackToThreads, closeChat } = useChatOverlay();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat details
  useEffect(() => {
    if (!activeChatId) return;

    const loadChat = async () => {
      try {
        const chatData = await getChat(activeChatId);
        setChat(chatData);
      } catch (error) {
        console.error("[ConversationView] Error loading chat:", error);
      }
    };

    loadChat();
  }, [activeChatId]);

  // Subscribe to messages
  useEffect(() => {
    if (!activeChatId) return;

    console.log(
      "[ConversationView] Setting up message subscription for chat:",
      activeChatId,
    );

    const unsubscribe = subscribeToMessages(activeChatId, (newMessages) => {
      console.log(
        "[ConversationView] Received message update, count:",
        newMessages.length,
      );
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      console.log("[ConversationView] Cleaning up message subscription");
      unsubscribe();
    };
  }, [activeChatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !activeChatId || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await sendMessage(activeChatId, {
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous",
        senderEmail: user.email || "",
      });

      console.log("[ConversationView] Message sent successfully");
    } catch (error) {
      console.error("[ConversationView] Error sending message:", error);
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleCompleteTransaction = async () => {
    if (!chat || !activeChatId || completing) return;

    Alert.alert(
      "Complete Transaction",
      "Are you sure you want to mark this help request as complete? This will close the chat for both users and archive the request.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          style: "default",
          onPress: async () => {
            setCompleting(true);
            try {
              // Finalize the help request
              await finalizeHelpRequest(chat.requestId);
              console.log(
                "[ConversationView] Request finalized:",
                chat.requestId,
              );

              // Finalize the chat
              await finalizeChat(activeChatId);
              console.log("[ConversationView] Chat finalized:", activeChatId);

              // Close the overlay
              closeChat();

              Alert.alert(
                "Transaction Complete",
                "The help request has been marked as complete and the chat has been closed.",
              );
            } catch (error) {
              console.error(
                "[ConversationView] Error completing transaction:",
                error,
              );
              Alert.alert(
                "Error",
                "Failed to complete transaction. Please try again.",
              );
            } finally {
              setCompleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading || !chat) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={METUColors.maroon} />
      </View>
    );
  }

  return (
    <View style={styles.conversationContainer}>
      {/* Chat header */}
      <View
        style={[
          styles.conversationHeader,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Pressable onPress={goBackToThreads} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.conversationTitle} numberOfLines={1}>
            {chat.requestTitle}
          </ThemedText>
          <ThemedText
            style={[
              styles.conversationSubtitle,
              { color: theme.textSecondary },
            ]}
            numberOfLines={1}
          >
            {user?.uid === chat.requesterId
              ? chat.helperName
              : chat.requesterName}
          </ThemedText>
        </View>
        <Pressable
          onPress={handleCompleteTransaction}
          disabled={completing}
          style={[styles.completeButton, { opacity: completing ? 0.5 : 1 }]}
        >
          {completing ? (
            <ActivityIndicator size="small" color={METUColors.actionGreen} />
          ) : (
            <>
              <Feather
                name="check-circle"
                size={18}
                color={METUColors.actionGreen}
              />
              <ThemedText
                style={[
                  styles.completeButtonText,
                  { color: METUColors.actionGreen },
                ]}
              >
                Complete
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.senderId === user?.uid} />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather
              name="message-circle"
              size={32}
              color={theme.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              No messages yet
            </ThemedText>
          </View>
        }
      />

      {/* Input area */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.cardBackground,
              color: theme.text,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (inputText.trim() && !sending) {
              handleSend();
            }
          }}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                !inputText.trim() || sending
                  ? theme.backgroundSecondary
                  : isDark
                    ? "#CC3333"
                    : METUColors.maroon,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={16} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Expanded chat window
 */
function ExpandedWindow() {
  const { theme, isDark } = useTheme();
  const { toggleMinimize, closeChat, activeView } = useChatOverlay();

  const content = (
    <View
      style={[
        styles.expandedContainer,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.expandedHeader,
          { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
        ]}
      >
        <ThemedText style={styles.expandedHeaderTitle}>
          {activeView === "threads" ? "Active Chats" : "Chat"}
        </ThemedText>
        <View style={styles.expandedHeaderActions}>
          <Pressable onPress={toggleMinimize} style={styles.headerButton}>
            <Feather name="minus" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={closeChat} style={styles.headerButton}>
            <Feather name="x" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.expandedContent}>
        {activeView === "threads" ? <ThreadListView /> : <ConversationView />}
      </View>
    </View>
  );

  // On mobile, use a modal
  if (!IS_WEB) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={closeChat}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>{content}</View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // On web, use absolute positioning
  return (
    <KeyboardAvoidingView style={styles.expandedWrapper} behavior="height">
      {content}
    </KeyboardAvoidingView>
  );
}

/**
 * Main ChatOverlay component
 */
export function ChatOverlay() {
  const { isOpen, isMinimized } = useChatOverlay();
  const { user } = useAuth();

  // Don't show overlay if user is not authenticated
  if (!user) return null;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {isMinimized ? <MinimizedBubble /> : isOpen && <ExpandedWindow />}
    </View>
  );
}

/**
 * Helper functions
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  // Minimized bubble styles
  bubble: {
    position: "absolute",
    bottom: IS_WEB ? Spacing["3xl"] : Spacing["6xl"],
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
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: METUColors.alertRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Expanded window styles
  expandedWrapper: {
    position: "absolute",
    bottom: IS_WEB ? Spacing["3xl"] : Spacing["6xl"],
    right: Spacing.xl,
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  expandedContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  expandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  expandedHeaderTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  expandedHeaderActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  expandedContent: {
    flex: 1,
  },

  // Modal styles (mobile)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: OVERLAY_HEIGHT,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: "hidden",
  },

  // Thread list styles
  threadListContainer: {
    flex: 1,
  },
  threadList: {
    padding: Spacing.xs,
  },
  threadItem: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  threadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(128, 0, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  threadTitle: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  threadTime: {
    fontSize: 10,
  },
  threadSubtitle: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
    marginBottom: 2,
  },
  threadMessage: {
    fontSize: 12,
  },

  // Conversation styles
  conversationContainer: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  conversationTitle: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  conversationSubtitle: {
    fontSize: 11,
  },
  messagesList: {
    padding: Spacing.sm,
    flexGrow: 1,
  },
  messageBubbleContainer: {
    marginVertical: Spacing.xs,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  senderName: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageText: {
    fontSize: Typography.small.fontSize,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 9,
    marginTop: 2,
  },

  // Input styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    fontSize: Typography.small.fontSize,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Common styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.small.fontSize,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
