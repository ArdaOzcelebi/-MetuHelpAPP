/**
 * ChatOverlayContext - Global state management for floating chat widget
 *
 * This context manages the global chat overlay state, including:
 * - Opening/closing the overlay
 * - Managing active chat threads
 * - Tracking unread message counts
 * - Navigating between thread list and conversation views
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { subscribeToUserChats } from "@/src/services/chatService";
import type { Chat } from "@/src/types/chat";

interface ChatOverlayContextValue {
  // UI state
  isOpen: boolean;
  isMinimized: boolean;
  activeView: "threads" | "conversation";
  activeChatId: string | null;

  // Data
  chats: Chat[];
  unreadCount: number;

  // Actions
  openChat: (chatId: string) => void;
  openChatByRequestId: (requestId: string) => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  goBackToThreads: () => void;
}

const ChatOverlayContext = createContext<ChatOverlayContextValue | undefined>(
  undefined,
);

export function ChatOverlayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeView, setActiveView] = useState<"threads" | "conversation">(
    "threads",
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Data state
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setUnreadCount(0);
      return;
    }

    console.log(
      "[ChatOverlayContext] Setting up chat subscription for user:",
      user.uid,
    );

    const unsubscribe = subscribeToUserChats(user.uid, (updatedChats) => {
      console.log(
        "[ChatOverlayContext] Received chat updates, total count:",
        updatedChats.length,
      );
      console.log(
        "[ChatOverlayContext] Chat details:",
        updatedChats.map((c) => ({
          id: c.id,
          requestId: c.requestId,
          status: c.status,
          requesterId: c.requesterId,
          helperId: c.helperId,
        })),
      );
      
      setChats(updatedChats);

      // TODO: Calculate unread count from messages
      // For now, show the number of active (non-finalized) chats as a placeholder
      const activeChats = updatedChats.filter(
        (chat) => chat.status !== "finalized",
      );
      console.log("[ChatOverlayContext] Active chats count:", activeChats.length);
      setUnreadCount(activeChats.length);
    });

    return () => {
      console.log("[ChatOverlayContext] Cleaning up chat subscription");
      unsubscribe();
    };
  }, [user]);

  // Actions
  const openChat = (chatId: string) => {
    console.log("[ChatOverlayContext] Opening chat:", chatId);
    setActiveChatId(chatId);
    setActiveView("conversation");
    setIsMinimized(false);
    setIsOpen(true);
  };

  const openChatByRequestId = (requestId: string) => {
    console.log("[ChatOverlayContext] Opening chat by request ID:", requestId);
    // Find chat with matching requestId
    const chat = chats.find((c) => c.requestId === requestId);
    if (chat) {
      openChat(chat.id);
    } else {
      console.warn(
        "[ChatOverlayContext] No chat found for request ID:",
        requestId,
      );
    }
  };

  const closeChat = () => {
    console.log("[ChatOverlayContext] Closing chat overlay");
    // Close and reset to initial state
    setIsOpen(false);
    setIsMinimized(true);
    setActiveView("threads");
    setActiveChatId(null);
  };

  const toggleMinimize = () => {
    console.log("[ChatOverlayContext] Toggling minimize state");
    if (isMinimized) {
      // Expanding - always show thread list initially
      // User can navigate to a specific conversation from there
      setIsMinimized(false);
      setIsOpen(true);
      setActiveView("threads");
      setActiveChatId(null);
    } else {
      // Minimizing
      setIsMinimized(true);
    }
  };

  const goBackToThreads = () => {
    console.log("[ChatOverlayContext] Going back to thread list");
    setActiveView("threads");
    setActiveChatId(null);
  };

  const value: ChatOverlayContextValue = {
    isOpen,
    isMinimized,
    activeView,
    activeChatId,
    chats,
    unreadCount,
    openChat,
    openChatByRequestId,
    closeChat,
    toggleMinimize,
    goBackToThreads,
  };

  return (
    <ChatOverlayContext.Provider value={value}>
      {children}
    </ChatOverlayContext.Provider>
  );
}

export function useChatOverlay() {
  const context = useContext(ChatOverlayContext);
  if (context === undefined) {
    throw new Error("useChatOverlay must be used within a ChatOverlayProvider");
  }
  return context;
}
