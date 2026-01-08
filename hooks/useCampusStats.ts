import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import { useAuth } from "@/src/contexts/AuthContext";

interface CampusStats {
  activeRequests: number;
  helpedToday: number;
  requestsPosted: number;
  helpGiven: number;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch real-time campus statistics from Firestore
 * Uses getCountFromServer for efficient counting without downloading documents
 *
 * Global Stats:
 * - activeRequests: Count of help requests with status 'active'
 * - helpedToday: Count of help requests fulfilled today
 *
 * Personal Stats (requires authenticated user):
 * - requestsPosted: Count of requests created by current user
 * - helpGiven: Count of fulfilled requests where current user was the helper
 */
export function useCampusStats(): CampusStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<CampusStats>({
    activeRequests: 0,
    helpedToday: 0,
    requestsPosted: 0,
    helpGiven: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const db = getFirestoreInstance();

        // Get the start of today (midnight)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);

        // Fetch all stats in parallel
        const [
          activeRequestsSnapshot,
          helpedTodaySnapshot,
          requestsPostedSnapshot,
          helpGivenSnapshot,
        ] = await Promise.all([
          // Global: Active Requests
          getCountFromServer(
            query(
              collection(db, "helpRequests"),
              where("status", "==", "active"),
            ),
          ),

          // Global: Helped Today
          getCountFromServer(
            query(
              collection(db, "helpRequests"),
              where("status", "==", "fulfilled"),
              where("updatedAt", ">=", startOfTodayTimestamp),
            ),
          ),

          // Personal: Requests Posted (only if user is authenticated)
          user
            ? getCountFromServer(
                query(
                  collection(db, "helpRequests"),
                  where("userId", "==", user.uid),
                ),
              )
            : Promise.resolve({ data: () => ({ count: 0 }) }),

          // Personal: Help Given (only if user is authenticated)
          user
            ? getCountFromServer(
                query(
                  collection(db, "helpRequests"),
                  where("helperId", "==", user.uid),
                  where("status", "==", "fulfilled"),
                ),
              )
            : Promise.resolve({ data: () => ({ count: 0 }) }),
        ]);

        if (isMounted) {
          setStats({
            activeRequests: activeRequestsSnapshot.data().count,
            helpedToday: helpedTodaySnapshot.data().count,
            requestsPosted: requestsPostedSnapshot.data().count,
            helpGiven: helpGivenSnapshot.data().count,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error("[useCampusStats] Error fetching stats:", err);
        if (isMounted) {
          setStats((prev) => ({
            ...prev,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : "Failed to fetch campus statistics",
          }));
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return stats;
}
