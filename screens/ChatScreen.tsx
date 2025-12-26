import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
  subscribeToChat,
  sendMessage,
  finalizeChat,
} from "@/src/services/chatService";
import { finalizeHelpRequest } from "@/src/services/helpRequestService";
import type { Chat, Message } from "@/src/types/chat";

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "Chat">;
  route: RouteProp<HomeStackParamList, "Chat">;
};

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { chatId, requestId } = route.params;

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) {
      Alert.alert(t.error, "Chat ID is missing");
      navigation.goBack();
      return;
    }

    const unsubscribe = subscribeToChat(chatId, (chatData) => {
      setChat(chatData);
      setLoading(false);

      // Scroll to bottom when new messages arrive
      if (chatData && chatData.messages.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, navigation, t.error]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !chat) return;

    const messageText = message.trim();
    setMessage("");
    setSending(true);

    try {
      await sendMessage(
        chatId,
        { message: messageText },
        user.uid,
        user.displayName || user.email || "Unknown",
        user.email || "",
      );
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert(t.error, t.failedToSendMessage);
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleFinalizeRequest = () => {
    Alert.alert(t.finalizeConfirm, t.finalizeConfirmMessage, [
      {
        text: t.cancel,
        style: "cancel",
      },
      {
        text: t.finalizeRequest,
        onPress: async () => {
          setFinalizing(true);
          try {
            // Finalize both chat and help request
            await Promise.all([
              finalizeChat(chatId),
              finalizeHelpRequest(requestId),
            ]);

            Alert.alert(
              t.requestFinalized,
              t.requestFinalizedMessage,
              [
                {
                  text: t.ok,
                  onPress: () => {
                    // Navigate back to home
                    navigation.navigate("Home");
                  },
                },
              ],
              { cancelable: false },
            );
          } catch (error) {
            console.error("Error finalizing request:", error);
            Alert.alert(t.error, t.failedToFinalizeRequest);
          } finally {
            setFinalizing(false);
          }
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = user?.uid === item.senderId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isCurrentUser
                ? isDark
                  ? METUColors.maroon
                  : METUColors.maroon
                : theme.cardBackground,
            },
          ]}
        >
          {!isCurrentUser && (
            <ThemedText
              style={[
                styles.senderName,
                { color: isDark ? METUColors.actionGreen : METUColors.maroon },
              ]}
            >
              {item.senderName}
            </ThemedText>
          )}
          <ThemedText
            style={[
              styles.messageText,
              { color: isCurrentUser ? "#FFFFFF" : theme.text },
            ]}
          >
            {item.message}
          </ThemedText>
          <ThemedText
            style={[
              styles.messageTime,
              {
                color: isCurrentUser
                  ? "rgba(255, 255, 255, 0.7)"
                  : theme.textSecondary,
              },
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={METUColors.maroon} />
      </ThemedView>
    );
  }

  if (!chat) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  const isFinalized = chat.status === "finalized";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ThemedView style={styles.container}>
        {/* Chat Header with request title */}
        <View
          style={[styles.chatHeader, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText style={styles.chatTitle}>{chat.requestTitle}</ThemedText>
          {isFinalized && (
            <View style={styles.finalizedBadge}>
              <Feather name="check-circle" size={14} color="#FFFFFF" />
              <ThemedText style={styles.finalizedText}>
                {t.statusFinalized}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Messages List */}
        {chat.messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="message-circle"
              size={48}
              color={theme.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              {t.noMessages}
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtext, { color: theme.textSecondary }]}
            >
              {t.startConversation}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chat.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input Area */}
        {!isFinalized && (
          <>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault,
                  },
                ]}
                placeholder={t.typeMessage}
                placeholderTextColor={theme.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSendMessage}
                disabled={!message.trim() || sending}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor:
                      !message.trim() || sending
                        ? theme.backgroundSecondary
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

            {/* Finalize Button */}
            <Pressable
              onPress={handleFinalizeRequest}
              disabled={finalizing}
              style={({ pressed }) => [
                styles.finalizeButton,
                {
                  backgroundColor: METUColors.actionGreen,
                  opacity: pressed || finalizing ? 0.8 : 1,
                },
              ]}
            >
              {finalizing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.finalizeButtonText}>
                    {t.finalizeRequest}
                  </ThemedText>
                </>
              )}
            </Pressable>
          </>
        )}
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
  errorText: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  chatHeader: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    flex: 1,
  },
  finalizedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: METUColors.actionGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  finalizedText: {
    color: "#FFFFFF",
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.body.fontSize,
    marginTop: Spacing.sm,
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: Spacing.md,
    maxWidth: "80%",
  },
  messageLeft: {
    alignSelf: "flex-start",
  },
  messageRight: {
    alignSelf: "flex-end",
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
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body.fontSize,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  finalizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  finalizeButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
});
