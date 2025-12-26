/**
 * Help Request Service - Firebase Firestore Integration
 *
 * This module provides a complete service layer for managing help requests in the METU Help app.
 * It encapsulates all Firestore operations and provides a clean API for UI components.
 *
 * Key Features:
 * - Real-time updates via Firestore onSnapshot listeners
 * - Type-safe operations with TypeScript interfaces
 * - Comprehensive error handling and logging
 * - Field validation and data sanitization
 * - Support for filtering by category and status
 *
 * Firestore Collection Structure:
 * Collection: 'helpRequests'
 * Document Fields:
 *   - title (string): What the user needs (maps to 'item' in requirements)
 *   - category (string): Category of the request (medical, academic, transport, other)
 *   - description (string): Additional details about the request
 *   - location (string): Where help is needed
 *   - isReturnNeeded (boolean): Whether the item needs to be returned (maps to 'needReturn')
 *   - urgent (boolean): Whether this is time-sensitive
 *   - isAnonymous (boolean): Whether posted anonymously
 *   - userId (string): ID of the user who created the request
 *   - userEmail (string): Email of the user
 *   - userName (string): Display name of the user
 *   - status (string): 'active' | 'fulfilled' | 'cancelled' (default: 'active')
 *   - createdAt (Timestamp): When the request was created
 *   - updatedAt (Timestamp): When the request was last updated
 *
 * Usage Example:
 * ```typescript
 * import {
 *   createHelpRequest,
 *   subscribeToHelpRequests,
 *   updateHelpRequestStatus
 * } from '@/src/services/helpRequestService';
 *
 * // Create a new request
 * const requestId = await createHelpRequest(
 *   {
 *     title: "Need a bandage",
 *     category: "medical",
 *     description: "Minor cut",
 *     location: "Library",
 *     isReturnNeeded: false,
 *     urgent: true
 *   },
 *   userId,
 *   userEmail,
 *   userName
 * );
 *
 * // Subscribe to real-time updates
 * const unsubscribe = subscribeToHelpRequests((requests) => {
 *   setRequests(requests);
 * });
 *
 * // Clean up listener when component unmounts
 * return () => unsubscribe();
 * ```
 *
 * @module helpRequestService
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
      isAnonymous: data.isAnonymous || false,
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
 *
 * @param requestData - The help request data including title (item), category, description, location, etc.
 * @param userId - The ID of the user creating the request
 * @param userEmail - The email of the user creating the request
 * @param userName - The display name of the user creating the request
 * @returns Promise resolving to the created document ID
 *
 * @example
 * const requestId = await createHelpRequest(
 *   {
 *     title: "Need a bandage",
 *     category: "medical",
 *     description: "Minor cut, need first aid",
 *     location: "Library",
 *     isReturnNeeded: false,
 *     urgent: true,
 *     isAnonymous: false
 *   },
 *   "user123",
 *   "user@metu.edu.tr",
 *   "John Doe"
 * );
 */
export async function createHelpRequest(
  requestData: CreateHelpRequestData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string> {
  try {
    console.log("[createHelpRequest] Starting with input:", {
      requestData,
      userId,
      userEmail,
      userName,
    });

    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const data = {
      ...requestData,
      isAnonymous: requestData.isAnonymous || false,
      userId,
      userEmail,
      userName,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    console.log("[createHelpRequest] Data to be written:", {
      ...data,
      createdAt: "Timestamp",
      updatedAt: "Timestamp",
    });

    // Validate that all required fields are present
    if (!data.title || !data.category || !data.location || !data.userId) {
      const error = new Error(
        "Missing required fields: " +
          JSON.stringify({
            hasTitle: !!data.title,
            hasCategory: !!data.category,
            hasLocation: !!data.location,
            hasUserId: !!data.userId,
          }),
      );
      console.error("[createHelpRequest] Validation failed:", error.message);
      throw error;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    console.log("[createHelpRequest] Successfully created with ID:", docRef.id);
    console.log("[createHelpRequest] Collection:", COLLECTION_NAME);
    return docRef.id;
  } catch (error) {
    console.error("[createHelpRequest] Error occurred:", error);
    if (error instanceof Error) {
      console.error("[createHelpRequest] Error message:", error.message);
      console.error("[createHelpRequest] Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Subscribe to active help requests with real-time updates via Firestore onSnapshot
 *
 * This function sets up a real-time listener that automatically updates when:
 * - New requests are added to Firestore
 * - Existing requests are modified
 * - Requests are deleted or their status changes
 *
 * NOTE: Results are sorted by createdAt (most recent first) on the client side
 * to avoid requiring a Firestore composite index. This is more efficient for
 * small to medium datasets and avoids the need to create and maintain indexes.
 *
 * @param callback - Function called with updated array of help requests whenever data changes
 * @param category - Optional category filter. If provided, only requests of this category are returned
 * @returns Unsubscribe function to stop listening for updates
 *
 * @example
 * // Subscribe to all active requests
 * const unsubscribe = subscribeToHelpRequests((requests) => {
 *   console.log('Updated requests:', requests);
 * });
 *
 * // Later, stop listening
 * unsubscribe();
 *
 * @example
 * // Subscribe to medical requests only
 * const unsubscribe = subscribeToHelpRequests(
 *   (requests) => setMedicalRequests(requests),
 *   'medical'
 * );
 */
export function subscribeToHelpRequests(
  callback: (requests: HelpRequest[]) => void,
  category?: HelpRequestCategory,
): Unsubscribe {
  try {
    const db = getFirestoreInstance();

    console.log(
      "[subscribeToHelpRequests] Setting up subscription, category:",
      category || "all",
    );

    // Simplified query without orderBy to avoid requiring composite index
    // We'll sort on the client side instead
    let q;
    if (category) {
      q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "active"),
        where("category", "==", category),
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "active"),
      );
    }

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        console.log(
          "[subscribeToHelpRequests] Snapshot received, document count:",
          snapshot.size,
        );

        if (snapshot.metadata.fromCache) {
          console.warn(
            "[subscribeToHelpRequests] Data is from cache, not server",
          );
        }

        const requests: HelpRequest[] = [];
        snapshot.forEach((doc) => {
          console.log(
            "[subscribeToHelpRequests] Processing document:",
            doc.id,
            doc.data(),
          );
          const request = documentToHelpRequest(doc.id, doc.data());
          if (request) {
            requests.push(request);
          } else {
            console.warn(
              "[subscribeToHelpRequests] Failed to convert document:",
              doc.id,
              "Data:",
              doc.data(),
            );
          }
        });

        // Sort by createdAt descending on client side (most recent first)
        requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log(
          "[subscribeToHelpRequests] Processed and sorted requests:",
          requests.length,
        );
        callback(requests);
      },
      (error) => {
        console.error("[subscribeToHelpRequests] Subscription error:", error);
        console.error("[subscribeToHelpRequests] Error code:", error.code);
        console.error(
          "[subscribeToHelpRequests] Error message:",
          error.message,
        );

        // Check if it's an index error
        if (
          error.code === "failed-precondition" &&
          error.message.includes("index")
        ) {
          console.error(
            "[subscribeToHelpRequests] FIRESTORE INDEX REQUIRED:",
          );
          console.error(
            "The query requires a composite index. This has been fixed by simplifying the query.",
          );
          console.error(
            "If you see this error, the simplified query should work now.",
          );
        }

        callback([]);
      },
    );
  } catch (error) {
    console.error("[subscribeToHelpRequests] Setup error:", error);
    // Return a no-op unsubscribe function
    return () => {
      console.log("[subscribeToHelpRequests] No-op unsubscribe called");
    };
  }
}

/**
 * Get a single help request by ID
 *
 * @param requestId - The unique ID of the help request document
 * @returns Promise resolving to the HelpRequest object or null if not found
 *
 * @example
 * const request = await getHelpRequest('abc123');
 * if (request) {
 *   console.log('Found request:', request.title);
 * }
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
 *
 * Use this function to mark requests as fulfilled, cancelled, or reactivate them.
 * Status changes affect whether requests appear in the active requests list.
 *
 * @param requestId - The unique ID of the help request
 * @param status - New status: 'active', 'fulfilled', or 'cancelled'
 * @returns Promise that resolves when the update is complete
 *
 * @example
 * // Mark a request as fulfilled
 * await updateHelpRequestStatus('abc123', 'fulfilled');
 *
 * @example
 * // Cancel a request
 * await updateHelpRequestStatus('abc123', 'cancelled');
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
 * Delete a help request permanently from Firestore
 *
 * WARNING: This operation is irreversible. Consider using updateHelpRequestStatus
 * to mark as 'cancelled' instead for soft deletion.
 *
 * @param requestId - The unique ID of the help request to delete
 * @returns Promise that resolves when deletion is complete
 *
 * @example
 * await deleteHelpRequest('abc123');
 */
export async function deleteHelpRequest(requestId: string): Promise<void> {
  const db = getFirestoreInstance();
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await deleteDoc(docRef);
}
