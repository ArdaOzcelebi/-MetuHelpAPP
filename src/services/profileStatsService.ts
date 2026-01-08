/**
 * Profile Stats Service
 *
 * Service for fetching user-specific statistics and activity for the profile screen
 */

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type { HelpRequest } from "@/src/types/helpRequest";
import type { QAQuestion } from "@/src/services/qaService";

export interface UserStats {
  requestsPosted: number;
  helpGiven: number;
  questionsAsked: number;
}

export interface RecentActivityItem {
  id: string;
  type: "request" | "question" | "help";
  title: string;
  timestamp: Date;
  status?: string;
}

/**
 * Get user statistics (requests posted, help given, questions asked)
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const db = getFirestoreInstance();

    // Count help requests posted by user
    const requestsQuery = query(
      collection(db, "helpRequests"),
      where("userId", "==", userId),
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    const requestsPosted = requestsSnapshot.size;

    // Count help given (requests accepted by user)
    const helpGivenQuery = query(
      collection(db, "helpRequests"),
      where("acceptedBy", "==", userId),
    );
    const helpGivenSnapshot = await getDocs(helpGivenQuery);
    const helpGiven = helpGivenSnapshot.size;

    // Count questions asked by user
    const questionsQuery = query(
      collection(db, "questions"),
      where("authorId", "==", userId),
    );
    const questionsSnapshot = await getDocs(questionsQuery);
    const questionsAsked = questionsSnapshot.size;

    return {
      requestsPosted,
      helpGiven,
      questionsAsked,
    };
  } catch (error) {
    console.error("[getUserStats] Error:", error);
    return {
      requestsPosted: 0,
      helpGiven: 0,
      questionsAsked: 0,
    };
  }
}

/**
 * Subscribe to user statistics with real-time updates
 */
export function subscribeToUserStats(
  userId: string,
  callback: (stats: UserStats) => void,
): Unsubscribe {
  const db = getFirestoreInstance();
  const unsubscribes: Unsubscribe[] = [];

  let stats: UserStats = {
    requestsPosted: 0,
    helpGiven: 0,
    questionsAsked: 0,
  };

  // Subscribe to help requests posted by user
  const requestsQuery = query(
    collection(db, "helpRequests"),
    where("userId", "==", userId),
  );
  unsubscribes.push(
    onSnapshot(requestsQuery, (snapshot) => {
      stats.requestsPosted = snapshot.size;
      callback({ ...stats });
    }),
  );

  // Subscribe to help given (requests accepted by user)
  const helpGivenQuery = query(
    collection(db, "helpRequests"),
    where("acceptedBy", "==", userId),
  );
  unsubscribes.push(
    onSnapshot(helpGivenQuery, (snapshot) => {
      stats.helpGiven = snapshot.size;
      callback({ ...stats });
    }),
  );

  // Subscribe to questions asked by user
  const questionsQuery = query(
    collection(db, "questions"),
    where("authorId", "==", userId),
  );
  unsubscribes.push(
    onSnapshot(questionsQuery, (snapshot) => {
      stats.questionsAsked = snapshot.size;
      callback({ ...stats });
    }),
  );

  // Return unsubscribe function that cleans up all listeners
  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
}

/**
 * Get recent activity for a user (up to 10 most recent items across all activity types)
 *
 * Returns a combined list of the user's help requests, help given, and questions,
 * sorted by timestamp with the most recent first. Limited to 10 total items.
 */
export async function getRecentActivity(
  userId: string,
): Promise<RecentActivityItem[]> {
  try {
    const db = getFirestoreInstance();
    const activities: RecentActivityItem[] = [];

    // Get user's help requests
    const requestsQuery = query(
      collection(db, "helpRequests"),
      where("userId", "==", userId),
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    requestsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip items with invalid timestamps
      if (!data.createdAt) {
        console.warn(
          `[getRecentActivity] Skipping request ${doc.id}: missing createdAt`,
        );
        return;
      }
      activities.push({
        id: doc.id,
        type: "request",
        title: data.title || "Help Request",
        timestamp: data.createdAt?.toDate() || new Date(0),
        status: data.status,
      });
    });

    // Get requests where user helped
    const helpGivenQuery = query(
      collection(db, "helpRequests"),
      where("acceptedBy", "==", userId),
    );
    const helpGivenSnapshot = await getDocs(helpGivenQuery);
    helpGivenSnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip items with invalid timestamps
      if (!data.updatedAt) {
        console.warn(
          `[getRecentActivity] Skipping help ${doc.id}: missing updatedAt`,
        );
        return;
      }
      activities.push({
        id: doc.id,
        type: "help",
        title: `Helped with: ${data.title || "Request"}`,
        timestamp: data.updatedAt?.toDate() || new Date(0),
        status: data.status,
      });
    });

    // Get user's questions
    const questionsQuery = query(
      collection(db, "questions"),
      where("authorId", "==", userId),
    );
    const questionsSnapshot = await getDocs(questionsQuery);
    questionsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip items with invalid timestamps
      if (!data.createdAt) {
        console.warn(
          `[getRecentActivity] Skipping question ${doc.id}: missing createdAt`,
        );
        return;
      }
      activities.push({
        id: doc.id,
        type: "question",
        title: data.title || "Question",
        timestamp: data.createdAt?.toDate() || new Date(0),
      });
    });

    // Sort by timestamp (most recent first) and return up to 10 items
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, 10);
  } catch (error) {
    console.error("[getRecentActivity] Error:", error);
    return [];
  }
}
