/**
 * Service for managing help requests in Firebase Firestore
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
  getDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type {
  HelpRequest,
  CreateHelpRequestData,
  HelpRequestCategory,
} from "@/src/types/helpRequest";

const COLLECTION_NAME = "helpRequests";

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
 * Convert Firestore document to HelpRequest object
 */
function documentToHelpRequest(
  id: string,
  data: DocumentData,
): HelpRequest | null {
  try {
    // Validate required fields
    if (!data.title || !data.category || !data.location || !data.userId) {
      console.warn(`Missing required fields in document ${id}`);
      return null;
    }

    return {
      id,
      title: data.title,
      category: data.category,
      description: data.description || "",
      location: data.location,
      isReturnNeeded: data.isReturnNeeded || false,
      urgent: data.urgent || false,
      userId: data.userId,
      userEmail: data.userEmail || "",
      userName: data.userName || "Anonymous",
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      status: data.status || "active",
    };
  } catch (error) {
    console.error("Error converting document to HelpRequest:", error);
    return null;
  }
}

/**
 * Create a new help request in Firestore
 */
export async function createHelpRequest(
  requestData: CreateHelpRequestData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string> {
  const db = getFirestoreInstance();
  const now = Timestamp.now();

  const data = {
    ...requestData,
    userId,
    userEmail,
    userName,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
  return docRef.id;
}

/**
 * Subscribe to active help requests with real-time updates
 */
export function subscribeToHelpRequests(
  callback: (requests: HelpRequest[]) => void,
  category?: HelpRequestCategory,
): Unsubscribe {
  const db = getFirestoreInstance();
  let q;

  if (category) {
    q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "active"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
    );
  } else {
    q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
    );
  }

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot) => {
      const requests: HelpRequest[] = [];
      snapshot.forEach((doc) => {
        const request = documentToHelpRequest(doc.id, doc.data());
        if (request) {
          requests.push(request);
        }
      });
      callback(requests);
    },
    (error) => {
      console.error("Error fetching help requests:", error);
      callback([]);
    },
  );
}

/**
 * Get a single help request by ID
 */
export async function getHelpRequest(
  requestId: string,
): Promise<HelpRequest | null> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return documentToHelpRequest(docSnap.id, docSnap.data());
  }
  return null;
}

/**
 * Update help request status
 */
export async function updateHelpRequestStatus(
  requestId: string,
  status: "active" | "fulfilled" | "cancelled",
): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a help request
 */
export async function deleteHelpRequest(requestId: string): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await deleteDoc(docRef);
}

/**
 * Accept a help request
 * Updates the request with acceptedBy info, changes status to "accepted",
 * and assigns a chatId
 */
export async function acceptHelpRequest(
  requestId: string,
  accepterId: string,
  accepterName: string,
  accepterEmail: string,
  chatId: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);

  await updateDoc(docRef, {
    status: "accepted",
    acceptedBy: accepterId,
    acceptedByName: accepterName,
    acceptedByEmail: accepterEmail,
    chatId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Finalize a help request (mark as completed)
 */
export async function finalizeHelpRequest(requestId: string): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);

  await updateDoc(docRef, {
    status: "finalized",
    updatedAt: Timestamp.now(),
  });
}
