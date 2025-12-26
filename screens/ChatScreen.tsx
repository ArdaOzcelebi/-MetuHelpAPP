import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import {
  subscribeToMessages,
  sendMessage,
  getChat,
} from "@/src/services/chatService";
import type { Message, Chat } from "@/src/types/chat";

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Chat">;
  route: RouteProp<HomeStackParamList, "Chat">;
};

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

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  // Format as date if older than 24 hours
  return date.toLocaleDateString();
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { chatId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load chat details
  useEffect(() => {
    if (!chatId) return;

    const loadChat = async () => {
      try {
        const chatData = await getChat(chatId);
        setChat(chatData);
      } catch (error) {
        console.error("[ChatScreen] Error loading chat:", error);
      }
    };

    loadChat();
  }, [chatId]);

  // Subscribe to messages with real-time updates using onSnapshot
  useEffect(() => {
    if (!chatId) return;

    console.log(
      "[ChatScreen] Setting up message subscription for chat:",
      chatId,
    );

    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      console.log(
        "[ChatScreen] Received message update, count:",
        newMessages.length,
      );
      setMessages(newMessages);
      setLoading(false);

      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      console.log("[ChatScreen] Cleaning up message subscription");
      unsubscribe();
    };
  }, [chatId]);

  // Safeguard: Check if chatId is missing
  if (!chatId) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={METUColors.alertRed} />
          <ThemedText style={styles.errorText}>Chat ID not found</ThemedText>
          <ThemedText
            style={[styles.errorSubtext, { color: theme.textSecondary }]}
          >
            Unable to load this conversation. Please try again.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleSend = async () => {
    if (!inputText.trim() || !user || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await sendMessage(chatId, {
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous",
        senderEmail: user.email || "",
      });

      console.log("[ChatScreen] Message sent successfully");
    } catch (error) {
      console.error("[ChatScreen] Error sending message:", error);
      // Restore the message text on error
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METUColors.maroon} />
          <ThemedText style={{ marginTop: Spacing.md }}>
            Loading chat...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ThemedView style={styles.container}>
        {/* Chat header with request info */}
        {chat && (
          <View
            style={[
              styles.chatHeader,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.chatHeaderTitle}>
              {chat.requestTitle}
            </ThemedText>
            <ThemedText
              style={[
                styles.chatHeaderSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              Chat with{" "}
              {user?.uid === chat.requesterId
                ? chat.helperName
                : chat.requesterName}
            </ThemedText>
          </View>
        )}

        {/* Messages list */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.senderId === user?.uid} />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="message-circle"
                size={48}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                No messages yet. Start the conversation!
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
              <Feather name="send" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: Typography.body.fontSize,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  chatHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  chatHeaderTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  chatHeaderSubtitle: {
    fontSize: Typography.small.fontSize,
    marginTop: 2,
  },
  messagesList: {
    padding: Spacing.md,
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
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  senderName: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: Typography.body.fontSize,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing["4xl"],
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    fontSize: Typography.body.fontSize,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
