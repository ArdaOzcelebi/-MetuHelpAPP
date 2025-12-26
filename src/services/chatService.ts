/**
 * Service for managing chats in Firebase Firestore
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  DocumentData,
  Unsubscribe,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type {
  Chat,
  CreateChatData,
  SendMessageData,
  Message,
} from "@/src/types/chat";

const COLLECTION_NAME = "chats";

/**
 * Convert Firestore timestamp to Date
 */
function convertTimestamp(timestamp: any): Date {
  // Handle Firestore Timestamp
  if (timestamp?.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  // Handle timestamp with seconds property
  if (timestamp?.seconds && typeof timestamp.seconds === "number") {
    return new Date(timestamp.seconds * 1000);
  }
  // Fallback to current date if timestamp is invalid
  return new Date();
}

/**
 * Convert Firestore document to Chat object
 */
function documentToChat(id: string, data: DocumentData): Chat | null {
  try {
    // Validate required fields
    if (!data.requestId || !data.members) {
      console.warn(`Missing required fields in chat document ${id}`);
      return null;
    }

    // Convert messages array
    const messages: Message[] = (data.messages || []).map((msg: any) => ({
      id: msg.id || `${msg.senderId}_${msg.timestamp?.seconds || Date.now()}`,
      senderId: msg.senderId,
      senderName: msg.senderName || "Unknown",
      senderEmail: msg.senderEmail || "",
      message: msg.message,
      timestamp: convertTimestamp(msg.timestamp),
    }));

    return {
      id,
      requestId: data.requestId,
      requestTitle: data.requestTitle || "",
      members: data.members || [],
      memberNames: data.memberNames || {},
      memberEmails: data.memberEmails || {},
      messages,
      status: data.status || "active",
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  } catch (error) {
    console.error("Error converting document to Chat:", error);
    return null;
  }
}

/**
 * Create a new chat in Firestore
 */
export async function createChat(chatData: CreateChatData): Promise<string> {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const data = {
      requestId: chatData.requestId,
      requestTitle: chatData.requestTitle,
      members: [chatData.requesterId, chatData.accepterId],
      memberNames: {
        [chatData.requesterId]: chatData.requesterName,
        [chatData.accepterId]: chatData.accepterName,
      },
      memberEmails: {
        [chatData.requesterId]: chatData.requesterEmail,
        [chatData.accepterId]: chatData.accepterEmail,
      },
      messages: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    console.log("[chatService] Creating chat with data:", {
      requestId: data.requestId,
      members: data.members,
    });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    console.log("[chatService] Chat created successfully:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[chatService] Failed to create chat:", error);
    throw error;
  }
}

/**
 * Get a single chat by ID
 */
export async function getChat(chatId: string): Promise<Chat | null> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, chatId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return documentToChat(docSnap.id, docSnap.data());
  }
  return null;
}

/**
 * Subscribe to a chat with real-time updates
 */
export function subscribeToChat(
  chatId: string,
  callback: (chat: Chat | null) => void,
): Unsubscribe {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, chatId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const chat = documentToChat(docSnap.id, docSnap.data());
        callback(chat);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error fetching chat:", error);
      callback(null);
    },
  );
}

/**
 * Send a message in a chat
 */
export async function sendMessage(
  chatId: string,
  messageData: SendMessageData,
  senderId: string,
  senderName: string,
  senderEmail: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, chatId);
  const now = Timestamp.now();

  const message = {
    id: `${senderId}_${now.seconds}`,
    senderId,
    senderName,
    senderEmail,
    message: messageData.message,
    timestamp: now,
  };

  await updateDoc(docRef, {
    messages: arrayUnion(message),
    updatedAt: now,
  });
}

/**
 * Finalize a chat (mark as completed)
 */
export async function finalizeChat(chatId: string): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, chatId);

  await updateDoc(docRef, {
    status: "finalized",
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get chat by request ID
 */
export async function getChatByRequestId(
  requestId: string,
): Promise<Chat | null> {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, COLLECTION_NAME),
    where("requestId", "==", requestId),
  );

  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const chat = documentToChat(doc.id, doc.data());
          unsubscribe();
          resolve(chat);
        } else {
          unsubscribe();
          resolve(null);
        }
      },
      (error) => {
        console.error("Error fetching chat by request ID:", error);
        unsubscribe();
        resolve(null);
      },
    );
  });
}
