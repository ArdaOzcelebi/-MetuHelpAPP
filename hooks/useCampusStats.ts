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

        // Fetch stats with individual error handling for each query
        const activeRequestsSnapshot = await getCountFromServer(
          query(collection(db, "helpRequests"), where("status", "==", "active")),
        ).catch((err) => {
          console.error("[useCampusStats] Error fetching active requests:", err);
          return { data: () => ({ count: 0 }) };
        });

        // Helped Today query - requires composite index
        // If index is missing, this will fail gracefully and return 0
        const helpedTodaySnapshot = await getCountFromServer(
          query(
            collection(db, "helpRequests"),
            where("status", "==", "fulfilled"),
            where("updatedAt", ">=", startOfTodayTimestamp),
          ),
        ).catch((err) => {
          // Check if it's a missing index error
          if (err.code === "failed-precondition" && err.message.includes("index")) {
            console.warn(
              "[useCampusStats] Firestore composite index required for 'Helped Today' query.",
              "Please create the index using the link in the error message.",
            );
          } else {
            console.error("[useCampusStats] Error fetching helped today:", err);
          }
          return { data: () => ({ count: 0 }) };
        });

        // Personal: Requests Posted (only if user is authenticated)
        const requestsPostedSnapshot = user
          ? await getCountFromServer(
              query(
                collection(db, "helpRequests"),
                where("userId", "==", user.uid),
              ),
            ).catch((err) => {
              console.error("[useCampusStats] Error fetching requests posted:", err);
              return { data: () => ({ count: 0 }) };
            })
          : { data: () => ({ count: 0 }) };

        // Personal: Help Given (only if user is authenticated)
        // This query also requires a composite index
        const helpGivenSnapshot = user
          ? await getCountFromServer(
              query(
                collection(db, "helpRequests"),
                where("acceptedBy", "==", user.uid),
                where("status", "==", "fulfilled"),
              ),
            ).catch((err) => {
              // Check if it's a missing index error
              if (err.code === "failed-precondition" && err.message.includes("index")) {
                console.warn(
                  "[useCampusStats] Firestore composite index required for 'Help Given' query.",
                  "Please create the index using the link in the error message.",
                );
              } else {
                console.error("[useCampusStats] Error fetching help given:", err);
              }
              return { data: () => ({ count: 0 }) };
            })
          : { data: () => ({ count: 0 }) };

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
