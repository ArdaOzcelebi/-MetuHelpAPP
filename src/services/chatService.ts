/**
 * Chat Service - Firebase Firestore Integration
 *
 * This module provides a complete service layer for managing chats and messages
 * in the METU Help app. It handles real-time chat updates and message delivery.
 *
 * Firestore Collection Structure:
 *
 * Collection: 'chats'
 * Document Fields:
 *   - requestId (string): The help request this chat is about
 *   - requestTitle (string): Title of the help request
 *   - requesterId (string): User ID of the person who posted the request
 *   - requesterName (string): Display name of requester
 *   - requesterEmail (string): Email of requester
 *   - helperId (string): User ID of the person offering help
 *   - helperName (string): Display name of helper
 *   - helperEmail (string): Email of helper
 *   - members (array): Array of user IDs [requesterId, helperId] - required for security rules
 *   - createdAt (Timestamp): When the chat was created
 *   - updatedAt (Timestamp): Last update time
 *   - lastMessage (string): Text of the last message
 *   - lastMessageAt (Timestamp): When last message was sent
 *
 * SubCollection: 'chats/{chatId}/messages'
 * Document Fields:
 *   - chatId (string): Parent chat ID
 *   - senderId (string): User ID of message sender
 *   - senderName (string): Display name of sender
 *   - senderEmail (string): Email of sender
 *   - text (string): Message content
 *   - createdAt (Timestamp): When the message was sent
 *
 * @module chatService
 */

import {
  collection,
  addDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  Unsubscribe,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type {
  Chat,
  Message,
  CreateChatData,
  SendMessageData,
} from "@/src/types/chat";

const CHATS_COLLECTION = "chats";
const MESSAGES_SUBCOLLECTION = "messages";

/**
 * Type for Firestore timestamp objects
 */
type FirestoreTimestamp =
  | Timestamp
  | { seconds: number; nanoseconds?: number; toDate?: () => Date }
  | null
  | undefined;

/**
 * Convert Firestore timestamp to Date
 */
function convertTimestamp(timestamp: FirestoreTimestamp): Date {
  if (timestamp?.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (
    timestamp &&
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    typeof timestamp.seconds === "number"
  ) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
}

/**
 * Convert Firestore document to Chat object
 */
function documentToChat(id: string, data: DocumentData): Chat | null {
  try {
    if (
      !data.requestId ||
      !data.requesterId ||
      !data.helperId ||
      !data.requestTitle
    ) {
      console.warn(`Missing required fields in chat document ${id}`);
      return null;
    }

    return {
      id,
      requestId: data.requestId,
      requestTitle: data.requestTitle,
      requesterId: data.requesterId,
      requesterName: data.requesterName || "Anonymous",
      requesterEmail: data.requesterEmail || "",
      helperId: data.helperId,
      helperName: data.helperName || "Anonymous",
      helperEmail: data.helperEmail || "",
      members: data.members || [data.requesterId, data.helperId],
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      lastMessage: data.lastMessage,
      lastMessageAt: data.lastMessageAt
        ? convertTimestamp(data.lastMessageAt)
        : undefined,
    };
  } catch (error) {
    console.error("Error converting document to Chat:", error);
    return null;
  }
}

/**
 * Convert Firestore document to Message object
 */
function documentToMessage(id: string, data: DocumentData): Message | null {
  try {
    if (!data.chatId || !data.senderId || !data.text) {
      console.warn(`Missing required fields in message document ${id}`);
      return null;
    }

    return {
      id,
      chatId: data.chatId,
      senderId: data.senderId,
      senderName: data.senderName || "Anonymous",
      senderEmail: data.senderEmail || "",
      text: data.text,
      createdAt: convertTimestamp(data.createdAt),
    };
  } catch (error) {
    console.error("Error converting document to Message:", error);
    return null;
  }
}

/**
 * Create a new chat when a helper offers to help
 *
 * @param chatData - The chat data including requester and helper info
 * @returns Promise resolving to the created chat ID
 */
export async function createChat(chatData: CreateChatData): Promise<string> {
  try {
    console.log("[createChat] Starting with input:", chatData);

    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const data = {
      ...chatData,
      members: [chatData.requesterId, chatData.helperId], // Required for Firebase security rules
      createdAt: now,
      updatedAt: now,
    };

    console.log("[createChat] Data to be written:", data);

    const docRef = await addDoc(collection(db, CHATS_COLLECTION), data);
    console.log("[createChat] Successfully created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[createChat] Error occurred:", error);
    throw error;
  }
}

/**
 * Get chat by request ID
 * Returns the chat if one exists for this request
 *
 * @param requestId - The help request ID
 * @returns Promise resolving to Chat or null if not found
 */
export async function getChatByRequestId(
  requestId: string,
): Promise<Chat | null> {
  try {
    console.log(
      "[getChatByRequestId] Checking for chat with requestId:",
      requestId,
    );

    const db = getFirestoreInstance();
    const q = query(
      collection(db, CHATS_COLLECTION),
      where("requestId", "==", requestId),
    );

    const querySnapshot = await getDocs(q);

    console.log("[getChatByRequestId] Found documents:", querySnapshot.size);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first chat found (there should only be one per request)
    const doc = querySnapshot.docs[0];
    const chat = documentToChat(doc.id, doc.data());
    console.log("[getChatByRequestId] Returning chat:", chat?.id);
    return chat;
  } catch (error) {
    console.error("[getChatByRequestId] Error occurred:", error);
    return null;
  }
}

/**
 * Get a specific chat by ID
 *
 * @param chatId - The chat document ID
 * @returns Promise resolving to Chat or null if not found
 */
export async function getChat(chatId: string): Promise<Chat | null> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return documentToChat(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("[getChat] Error occurred:", error);
    return null;
  }
}

/**
 * Subscribe to messages in a chat with real-time updates
 *
 * @param chatId - The chat ID to listen to
 * @param callback - Function called with updated array of messages
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  try {
    console.log("[ChatScreen] Listening to messages for Chat ID:", chatId);

    const db = getFirestoreInstance();
    const messagesRef = collection(
      db,
      CHATS_COLLECTION,
      chatId,
      MESSAGES_SUBCOLLECTION,
    );
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "[subscribeToMessages] Snapshot received, message count:",
          snapshot.size,
        );

        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          console.log("[ChatScreen] Message received:", doc.id, doc.data());
          const message = documentToMessage(doc.id, doc.data());
          if (message) {
            messages.push(message);
          }
        });

        console.log(
          "[subscribeToMessages] Processed messages:",
          messages.length,
        );
        callback(messages);
      },
      (error) => {
        console.error("[subscribeToMessages] Subscription error:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("[subscribeToMessages] Setup error:", error);
    return () => {
      console.log("[subscribeToMessages] No-op unsubscribe called");
    };
  }
}

/**
 * Send a message in a chat
 *
 * @param chatId - The chat ID to send the message to
 * @param messageData - The message data including text and sender info
 * @returns Promise that resolves when the message is sent
 */
export async function sendMessage(
  chatId: string,
  messageData: SendMessageData,
): Promise<void> {
  try {
    console.log("[sendMessage] Sending message to chat:", chatId);

    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const message = {
      chatId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderEmail: messageData.senderEmail,
      text: messageData.text,
      createdAt: now,
    };

    // Add message to subcollection
    const messagesRef = collection(
      db,
      CHATS_COLLECTION,
      chatId,
      MESSAGES_SUBCOLLECTION,
    );
    await addDoc(messagesRef, message);

    // Update chat's lastMessage and lastMessageAt
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData.text,
      lastMessageAt: now,
      updatedAt: now,
    });

    console.log("[sendMessage] Message sent successfully");
  } catch (error) {
    console.error("[sendMessage] Error occurred:", error);
    throw error;
  }
}

/**
 * Subscribe to chats for a specific user (as requester or helper)
 *
 * @param userId - The user ID to get chats for
 * @param callback - Function called with updated array of chats
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: Chat[]) => void,
): Unsubscribe {
  try {
    console.log(
      "[subscribeToUserChats] Setting up subscription for user:",
      userId,
    );

    const db = getFirestoreInstance();

    // Query for chats where user is either requester or helper
    // Note: This requires creating two separate queries since Firestore doesn't support OR queries
    // For simplicity, we'll query for requester chats first
    const q1 = query(
      collection(db, CHATS_COLLECTION),
      where("requesterId", "==", userId),
    );

    const q2 = query(
      collection(db, CHATS_COLLECTION),
      where("helperId", "==", userId),
    );

    const chatsMap = new Map<string, Chat>();

    const updateChats = () => {
      const allChats = Array.from(chatsMap.values());
      allChats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      callback(allChats);
    };

    // Subscribe to both queries
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      snapshot.forEach((doc) => {
        const chat = documentToChat(doc.id, doc.data());
        if (chat) {
          chatsMap.set(doc.id, chat);
        }
      });
      updateChats();
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      snapshot.forEach((doc) => {
        const chat = documentToChat(doc.id, doc.data());
        if (chat) {
          chatsMap.set(doc.id, chat);
        }
      });
      updateChats();
    });

    // Return combined unsubscribe function
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  } catch (error) {
    console.error("[subscribeToUserChats] Setup error:", error);
    return () => {
      console.log("[subscribeToUserChats] No-op unsubscribe called");
    };
  }
}
