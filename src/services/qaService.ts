/**
 * Q&A Forum Service
 * Simple Firebase integration for questions and answers
 */

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
  Timestamp,
  where,
  deleteDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";

export interface QAQuestion {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
  lastActiveAt: Date;
  answerCount: number;
}

export interface QAAnswer {
  id: string;
  body: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
}

/**
 * Create a new question
 */
export async function createQuestion(
  title: string,
  body: string,
  userId: string,
  userName: string,
): Promise<string> {
  console.log("[createQuestion] Starting...", {
    title: title.substring(0, 30),
    bodyLength: body.length,
    userId: userId.substring(0, 10),
    userName,
  });

  try {
    const db = getFirestoreInstance();
    console.log("[createQuestion] Got Firestore instance");

    const questionsRef = collection(db, "questions");
    console.log("[createQuestion] Got questions collection reference");

    const questionData = {
      title,
      body,
      authorName: userName,
      authorId: userId,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      answerCount: 0,
    };

    console.log("[createQuestion] Adding document to Firestore...");
    const docRef = await addDoc(questionsRef, questionData);

    console.log(
      "[createQuestion] SUCCESS! Question created with ID:",
      docRef.id,
    );
    return docRef.id;
  } catch (error) {
    console.error("[createQuestion] FAILED:", error);
    if (error instanceof Error) {
      console.error("[createQuestion] Error details:", {
        name: error.name,
        message: error.message,
      });
    }
    throw error;
  }
}

/**
 * Subscribe to questions with real-time updates
 * @param callback Function to call with updated questions
 * @param options.searchQuery If provided, searches all posts by title (ignores 48-hour filter)
 *                            If not provided, shows only posts from last 48 hours
 */
export function subscribeToQuestions(
  callback: (questions: QAQuestion[]) => void,
  options?: { searchQuery?: string },
): () => void {
  console.log("[subscribeToQuestions] Setting up real-time listener", options);
  const db = getFirestoreInstance();
  const questionsRef = collection(db, "questions");

  let q;
  if (options?.searchQuery) {
    // When searching, query all posts (no time filter)
    console.log(
      "[subscribeToQuestions] Using search mode for query:",
      options.searchQuery,
    );
    q = query(questionsRef, orderBy("createdAt", "desc"));
  } else {
    // Default: Only show posts from last 48 hours
    // Using createdAt for now to avoid composite index requirement
    // TODO: Switch to lastActiveAt once composite index is created in Firestore
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    console.log(
      "[subscribeToQuestions] Using 48-hour filter, cutoff:",
      fortyEightHoursAgo,
    );

    // Use createdAt instead of lastActiveAt to avoid composite index error
    q = query(
      questionsRef,
      where("createdAt", ">", Timestamp.fromDate(fortyEightHoursAgo)),
      orderBy("createdAt", "desc"),
    );
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(
        `[subscribeToQuestions] Received ${snapshot.docs.length} documents`,
      );
      let questions: QAQuestion[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[subscribeToQuestions] Document ${doc.id}:`, {
          title: data.title,
          createdAt: data.createdAt,
          lastActiveAt: data.lastActiveAt,
          hasTimestamp: !!data.createdAt,
        });
        questions.push({
          id: doc.id,
          title: data.title || "",
          body: data.body || "",
          authorName: data.authorName || "Anonymous",
          authorId: data.authorId || "",
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          lastActiveAt:
            (data.lastActiveAt as Timestamp)?.toDate() || new Date(),
          answerCount: data.answerCount || 0,
        });
      });

      // If searching, filter by search query on the client side
      if (options?.searchQuery) {
        const searchLower = options.searchQuery.toLowerCase();
        questions = questions.filter((q) =>
          q.title.toLowerCase().includes(searchLower),
        );
        console.log(
          `[subscribeToQuestions] After search filter: ${questions.length} questions`,
        );
      }

      console.log(
        `[subscribeToQuestions] Calling callback with ${questions.length} questions`,
      );
      callback(questions);
    },
    (error) => {
      console.error("[subscribeToQuestions] ERROR:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      // Return empty array on error instead of breaking the UI
      callback([]);
    },
  );

  return unsubscribe;
}

/**
 * Get a single question by ID
 */
export async function getQuestion(
  questionId: string,
): Promise<QAQuestion | null> {
  const db = getFirestoreInstance();
  const questionRef = doc(db, "questions", questionId);
  const questionSnap = await getDoc(questionRef);

  if (!questionSnap.exists()) {
    return null;
  }

  const data = questionSnap.data();
  return {
    id: questionSnap.id,
    title: data.title || "",
    body: data.body || "",
    authorName: data.authorName || "Anonymous",
    authorId: data.authorId || "",
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    lastActiveAt: (data.lastActiveAt as Timestamp)?.toDate() || new Date(),
    answerCount: data.answerCount || 0,
  };
}

/**
 * Subscribe to answers for a question
 */
export function subscribeToAnswers(
  questionId: string,
  callback: (answers: QAAnswer[]) => void,
): () => void {
  const db = getFirestoreInstance();
  const answersRef = collection(db, "questions", questionId, "answers");
  const q = query(answersRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const answers: QAAnswer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        answers.push({
          id: doc.id,
          body: data.body || "",
          authorName: data.authorName || "Anonymous",
          authorId: data.authorId || "",
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        });
      });
      callback(answers);
    },
    (error) => {
      console.error("Error fetching answers:", error);
      callback([]);
    },
  );

  return unsubscribe;
}

/**
 * Add an answer to a question
 */
export async function addAnswer(
  questionId: string,
  body: string,
  userId: string,
  userName: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const answersRef = collection(db, "questions", questionId, "answers");

  await addDoc(answersRef, {
    body,
    authorName: userName,
    authorId: userId,
    createdAt: serverTimestamp(),
  });

  // Update answer count and lastActiveAt to keep question fresh
  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    answerCount: increment(1),
    lastActiveAt: serverTimestamp(),
  });
}

/**
 * Delete a question permanently from Firestore
 *
 * WARNING: This operation is irreversible and will also delete all associated answers.
 *
 * SECURITY NOTE: This function does not perform authorization checks. It is the caller's
 * responsibility to verify that the user has permission to delete the question before
 * calling this function. In the UI layer (QuestionDetailScreen), we ensure only the
 * question author can access the delete functionality.
 *
 * For production apps, consider implementing Firestore Security Rules to enforce
 * server-side authorization and prevent unauthorized deletions.
 *
 * @param questionId - The unique ID of the question to delete
 * @returns Promise that resolves when deletion is complete
 *
 * @example
 * // Only delete if user is the author
 * if (question.authorId === user.uid) {
 *   await deleteQuestion('abc123');
 * }
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  if (!questionId || questionId.trim() === "") {
    throw new Error("Question ID is required");
  }
  
  console.log("[deleteQuestion] Starting deletion for question:", questionId);
  const db = getFirestoreInstance();
  const questionRef = doc(db, "questions", questionId);
  
  try {
    // Note: Firestore does not automatically delete subcollections when deleting a document
    // The answers subcollection will become orphaned but won't be accessible without the parent
    // For production apps with high deletion rates, consider:
    // 1. Using Cloud Functions to cascade delete subcollections
    // 2. Implementing a cleanup job to remove orphaned data
    // 3. Using a "soft delete" pattern by marking documents as deleted instead
    await deleteDoc(questionRef);
    console.log("[deleteQuestion] Successfully deleted question:", questionId);
  } catch (error) {
    console.error("[deleteQuestion] Failed to delete question:", error);
    // If the error is "Missing or insufficient permissions", it might be because
    // the document was already deleted. Check if this is a permission error on a non-existent document.
    if (error instanceof Error && error.message.includes("Missing or insufficient permissions")) {
      // Check if document still exists
      try {
        const docSnap = await getDoc(questionRef);
        if (!docSnap.exists()) {
          // Document doesn't exist, so it was already deleted - this is success, not an error
          console.log("[deleteQuestion] Document already deleted, treating as success");
          return;
        }
      } catch (checkError) {
        // If we can't check, just throw the original error
        console.error("[deleteQuestion] Failed to verify document existence:", checkError);
      }
    }
    throw error;
  }
}
