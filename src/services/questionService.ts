/**
 * Question Service - Firebase Firestore Integration for Q&A Forum
 *
 * This module provides a complete service layer for managing questions and answers
 * in the METU Help app's Q&A forum. It encapsulates all Firestore operations
 * related to questions, answers, and voting.
 *
 * Key Features:
 * - Real-time updates via Firestore onSnapshot listeners
 * - Type-safe operations with TypeScript interfaces
 * - Comprehensive error handling and logging
 * - Voting system with duplicate vote prevention
 * - Answer management with accepted answer support
 * - Search and filter capabilities
 *
 * Firestore Collection Structure:
 * Collection: 'questions'
 * Document Fields:
 *   - title (string): Question title
 *   - body (string): Detailed explanation
 *   - tags (array): Array of tag strings
 *   - author (object): { uid, name, email }
 *   - votes (number): Net vote count
 *   - answerCount (number): Number of answers
 *   - hasAcceptedAnswer (boolean): Whether an answer is accepted
 *   - status (string): 'open' | 'closed'
 *   - createdAt (Timestamp): Creation time
 *   - updatedAt (Timestamp): Last update time
 *
 * Subcollection: 'questions/{questionId}/answers'
 * Document Fields:
 *   - body (string): Answer content
 *   - author (object): { uid, name, email }
 *   - votes (number): Net vote count
 *   - accepted (boolean): Whether this is the accepted answer
 *   - createdAt (Timestamp): Creation time
 *   - updatedAt (Timestamp): Last update time
 *
 * Collection: 'votes'
 * Document ID: '{userId}_{itemId}'
 * Fields:
 *   - userId (string): User who voted
 *   - itemId (string): Question or answer ID
 *   - itemType (string): 'question' | 'answer'
 *   - voteType (string): 'upvote' | 'downvote'
 *   - createdAt (Timestamp): When vote was cast
 *   - updatedAt (Timestamp): When vote was changed
 *
 * @module questionService
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
  getDoc,
  getDocs,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
  increment,
  writeBatch,
  setDoc,
  limit,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";
import type {
  Question,
  CreateQuestionData,
  Answer,
  CreateAnswerData,
  Vote,
  VoteType,
  QuestionFilters,
} from "@/src/types/question";

const QUESTIONS_COLLECTION = "questions";
const ANSWERS_COLLECTION = "answers";
const VOTES_COLLECTION = "votes";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Firestore timestamp to Date
 */
function convertTimestamp(timestamp: any): Date {
  if (timestamp?.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp?.seconds && typeof timestamp.seconds === "number") {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
}

/**
 * Convert Firestore document to Question object
 */
function documentToQuestion(id: string, data: DocumentData): Question | null {
  try {
    if (!data.title || !data.author?.uid) {
      console.warn(`Missing required fields in question document ${id}`);
      return null;
    }

    return {
      id,
      title: data.title,
      body: data.body || "",
      tags: data.tags || [],
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      author: {
        uid: data.author.uid,
        name: data.author.name || "Anonymous",
        email: data.author.email || "",
      },
      votes: data.votes || 0,
      answerCount: data.answerCount || 0,
      hasAcceptedAnswer: data.hasAcceptedAnswer || false,
      status: data.status || "open",
    };
  } catch (error) {
    console.error("Error converting document to Question:", error);
    return null;
  }
}

/**
 * Convert Firestore document to Answer object
 */
function documentToAnswer(
  id: string,
  data: DocumentData,
  questionId: string,
): Answer | null {
  try {
    if (!data.body || !data.author?.uid) {
      console.warn(`Missing required fields in answer document ${id}`);
      return null;
    }

    return {
      id,
      body: data.body,
      author: {
        uid: data.author.uid,
        name: data.author.name || "Anonymous",
        email: data.author.email || "",
      },
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      votes: data.votes || 0,
      accepted: data.accepted || false,
      questionId,
    };
  } catch (error) {
    console.error("Error converting document to Answer:", error);
    return null;
  }
}

// ============================================================================
// QUESTION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new question in Firestore
 *
 * @param questionData - The question data (title, body, tags)
 * @param userId - The ID of the user creating the question
 * @param userEmail - The email of the user
 * @param userName - The display name of the user
 * @returns Promise resolving to the created document ID
 *
 * @example
 * const questionId = await createQuestion(
 *   {
 *     title: "How to find housing near campus?",
 *     body: "What are some websites or resources?",
 *     tags: ["housing", "students"]
 *   },
 *   "user123",
 *   "user@metu.edu.tr",
 *   "John Doe"
 * );
 */
export async function createQuestion(
  questionData: CreateQuestionData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string> {
  try {
    console.log("[createQuestion] Starting with input:", {
      questionData,
      userId,
      userEmail,
      userName,
    });

    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const data = {
      title: questionData.title,
      body: questionData.body || "",
      tags: questionData.tags || [],
      author: {
        uid: userId,
        name: userName,
        email: userEmail,
      },
      votes: 0,
      answerCount: 0,
      hasAcceptedAnswer: false,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };

    // Validate required fields
    if (!data.title || !data.author.uid) {
      throw new Error("Missing required fields: title or author.uid");
    }

    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), data);
    console.log("[createQuestion] Successfully created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[createQuestion] Error occurred:", error);
    throw error;
  }
}

/**
 * Subscribe to questions with real-time updates
 *
 * @param callback - Function called with updated array of questions
 * @param filters - Optional filters for questions
 * @returns Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = subscribeToQuestions((questions) => {
 *   console.log('Updated questions:', questions);
 * }, { tags: ["housing"], sortBy: "recent" });
 */
export function subscribeToQuestions(
  callback: (questions: Question[]) => void,
  filters?: QuestionFilters,
): Unsubscribe {
  try {
    const db = getFirestoreInstance();

    console.log(
      "[subscribeToQuestions] Setting up subscription with filters:",
      filters,
    );

    // Build base query
    let q = query(collection(db, QUESTIONS_COLLECTION));

    // Apply status filter
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status));
    }

    // Apply tag filter (if single tag provided)
    if (filters?.tags && filters.tags.length === 1) {
      q = query(q, where("tags", "array-contains", filters.tags[0]));
    }

    // Client-side filtering will be applied for:
    // - Multiple tags (array-contains only works with single value)
    // - Search query (Firestore doesn't support text search natively)
    // - Sort options

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        console.log(
          "[subscribeToQuestions] Snapshot received, document count:",
          snapshot.size,
        );

        const questions: Question[] = [];
        snapshot.forEach((doc) => {
          const question = documentToQuestion(doc.id, doc.data());
          if (question) {
            questions.push(question);
          }
        });

        // Apply client-side filters
        let filteredQuestions = questions;

        // Filter by multiple tags (if provided)
        if (filters?.tags && filters.tags.length > 1) {
          filteredQuestions = filteredQuestions.filter((q) =>
            filters.tags!.some((tag) => q.tags.includes(tag)),
          );
        }

        // Filter by search query
        if (filters?.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          filteredQuestions = filteredQuestions.filter(
            (q) =>
              q.title.toLowerCase().includes(searchLower) ||
              q.body.toLowerCase().includes(searchLower),
          );
        }

        // Filter unanswered if needed
        if (filters?.sortBy === "unanswered") {
          filteredQuestions = filteredQuestions.filter(
            (q) => q.answerCount === 0,
          );
        }

        // Apply sorting
        switch (filters?.sortBy) {
          case "popular":
            filteredQuestions.sort((a, b) => b.votes - a.votes);
            break;
          case "unanswered":
          case "recent":
          default:
            filteredQuestions.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            );
            break;
        }

        console.log(
          "[subscribeToQuestions] Processed and filtered questions:",
          filteredQuestions.length,
        );
        callback(filteredQuestions);
      },
      (error) => {
        console.error("[subscribeToQuestions] Subscription error:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("[subscribeToQuestions] Setup error:", error);
    return () => {
      console.log("[subscribeToQuestions] No-op unsubscribe called");
    };
  }
}

/**
 * Get a single question by ID
 *
 * @param questionId - The unique ID of the question document
 * @returns Promise resolving to the Question object or null if not found
 */
export async function getQuestion(
  questionId: string,
): Promise<Question | null> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return documentToQuestion(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("[getQuestion] Error:", error);
    return null;
  }
}

/**
 * Update a question (owner only)
 *
 * @param questionId - The ID of the question to update
 * @param updates - Partial question data to update
 * @param userId - The ID of the user making the update
 * @returns Promise that resolves when update is complete
 */
export async function updateQuestion(
  questionId: string,
  updates: Partial<CreateQuestionData>,
  userId: string,
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);

    // Verify ownership
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Question not found");
    }

    const question = docSnap.data();
    if (question.author.uid !== userId) {
      throw new Error("You can only edit your own questions");
    }

    // Update the question
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log("[updateQuestion] Question updated successfully:", questionId);
  } catch (error) {
    console.error("[updateQuestion] Error:", error);
    throw error;
  }
}

/**
 * Delete a question (owner only)
 * Also deletes all answers and votes associated with the question
 *
 * @param questionId - The ID of the question to delete
 * @param userId - The ID of the user making the deletion
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteQuestion(
  questionId: string,
  userId: string,
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);

    // Verify ownership
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Question not found");
    }

    const question = docSnap.data();
    if (question.author.uid !== userId) {
      throw new Error("You can only delete your own questions");
    }

    // Delete all answers (in batches if needed)
    const answersRef = collection(docRef, ANSWERS_COLLECTION);
    const answersSnapshot = await getDocs(answersRef);

    const batch = writeBatch(db);
    answersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the question
    batch.delete(docRef);

    await batch.commit();

    console.log(
      "[deleteQuestion] Question and answers deleted successfully:",
      questionId,
    );
  } catch (error) {
    console.error("[deleteQuestion] Error:", error);
    throw error;
  }
}

// ============================================================================
// ANSWER OPERATIONS
// ============================================================================

/**
 * Add an answer to a question
 *
 * @param questionId - The ID of the question being answered
 * @param answerData - The answer data
 * @param userId - The ID of the user posting the answer
 * @param userEmail - The email of the user
 * @param userName - The display name of the user
 * @returns Promise resolving to the created answer ID
 */
export async function addAnswer(
  questionId: string,
  answerData: CreateAnswerData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string> {
  try {
    console.log("[addAnswer] Adding answer to question:", questionId);

    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const answersRef = collection(questionRef, ANSWERS_COLLECTION);

    const data = {
      body: answerData.body,
      author: {
        uid: userId,
        name: userName,
        email: userEmail,
      },
      votes: 0,
      accepted: false,
      createdAt: now,
      updatedAt: now,
    };

    // Add answer and increment answer count
    const batch = writeBatch(db);

    const answerDocRef = doc(answersRef);
    batch.set(answerDocRef, data);

    batch.update(questionRef, {
      answerCount: increment(1),
      updatedAt: now,
    });

    await batch.commit();

    console.log("[addAnswer] Answer added successfully:", answerDocRef.id);
    return answerDocRef.id;
  } catch (error) {
    console.error("[addAnswer] Error:", error);
    throw error;
  }
}

/**
 * Subscribe to answers for a specific question with real-time updates
 *
 * @param questionId - The ID of the question
 * @param callback - Function called with updated array of answers
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToAnswers(
  questionId: string,
  callback: (answers: Answer[]) => void,
): Unsubscribe {
  try {
    const db = getFirestoreInstance();
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const answersRef = collection(questionRef, ANSWERS_COLLECTION);

    console.log("[subscribeToAnswers] Setting up subscription for:", questionId);

    const q = query(answersRef, orderBy("createdAt", "asc"));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        console.log(
          "[subscribeToAnswers] Snapshot received, answer count:",
          snapshot.size,
        );

        const answers: Answer[] = [];
        snapshot.forEach((doc) => {
          const answer = documentToAnswer(doc.id, doc.data(), questionId);
          if (answer) {
            answers.push(answer);
          }
        });

        // Sort to put accepted answer first
        answers.sort((a, b) => {
          if (a.accepted && !b.accepted) return -1;
          if (!a.accepted && b.accepted) return 1;
          return 0;
        });

        callback(answers);
      },
      (error) => {
        console.error("[subscribeToAnswers] Subscription error:", error);
        callback([]);
      },
    );
  } catch (error) {
    console.error("[subscribeToAnswers] Setup error:", error);
    return () => {};
  }
}

/**
 * Update an answer (owner only)
 *
 * @param questionId - The ID of the question
 * @param answerId - The ID of the answer to update
 * @param updates - Partial answer data to update
 * @param userId - The ID of the user making the update
 * @returns Promise that resolves when update is complete
 */
export async function updateAnswer(
  questionId: string,
  answerId: string,
  updates: Partial<CreateAnswerData>,
  userId: string,
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const answerRef = doc(questionRef, ANSWERS_COLLECTION, answerId);

    // Verify ownership
    const docSnap = await getDoc(answerRef);
    if (!docSnap.exists()) {
      throw new Error("Answer not found");
    }

    const answer = docSnap.data();
    if (answer.author.uid !== userId) {
      throw new Error("You can only edit your own answers");
    }

    // Update the answer
    await updateDoc(answerRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log("[updateAnswer] Answer updated successfully:", answerId);
  } catch (error) {
    console.error("[updateAnswer] Error:", error);
    throw error;
  }
}

/**
 * Delete an answer (owner only)
 *
 * @param questionId - The ID of the question
 * @param answerId - The ID of the answer to delete
 * @param userId - The ID of the user making the deletion
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteAnswer(
  questionId: string,
  answerId: string,
  userId: string,
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
    const answerRef = doc(questionRef, ANSWERS_COLLECTION, answerId);

    // Verify ownership
    const docSnap = await getDoc(answerRef);
    if (!docSnap.exists()) {
      throw new Error("Answer not found");
    }

    const answer = docSnap.data();
    if (answer.author.uid !== userId) {
      throw new Error("You can only delete your own answers");
    }

    // Delete answer and decrement answer count
    const batch = writeBatch(db);

    batch.delete(answerRef);
    batch.update(questionRef, {
      answerCount: increment(-1),
      updatedAt: Timestamp.now(),
    });

    // If this was the accepted answer, update question
    if (answer.accepted) {
      batch.update(questionRef, {
        hasAcceptedAnswer: false,
      });
    }

    await batch.commit();

    console.log("[deleteAnswer] Answer deleted successfully:", answerId);
  } catch (error) {
    console.error("[deleteAnswer] Error:", error);
    throw error;
  }
}

/**
 * Mark an answer as accepted (question owner only)
 * Only one answer can be accepted per question
 *
 * @param questionId - The ID of the question
 * @param answerId - The ID of the answer to mark as accepted
 * @param userId - The ID of the user (must be question owner)
 * @returns Promise that resolves when update is complete
 */
export async function markAnswerAsAccepted(
  questionId: string,
  answerId: string,
  userId: string,
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);

    // Verify question ownership
    const questionSnap = await getDoc(questionRef);
    if (!questionSnap.exists()) {
      throw new Error("Question not found");
    }

    const question = questionSnap.data();
    if (question.author.uid !== userId) {
      throw new Error("Only the question owner can accept answers");
    }

    const batch = writeBatch(db);

    // If there's already an accepted answer, unaccept it
    if (question.hasAcceptedAnswer) {
      const answersRef = collection(questionRef, ANSWERS_COLLECTION);
      const acceptedAnswersQuery = query(
        answersRef,
        where("accepted", "==", true),
      );
      const acceptedSnapshot = await getDocs(acceptedAnswersQuery);

      acceptedSnapshot.forEach((doc) => {
        batch.update(doc.ref, { accepted: false });
      });
    }

    // Mark the new answer as accepted
    const answerRef = doc(questionRef, ANSWERS_COLLECTION, answerId);
    batch.update(answerRef, {
      accepted: true,
      updatedAt: Timestamp.now(),
    });

    // Update question to indicate it has an accepted answer
    batch.update(questionRef, {
      hasAcceptedAnswer: true,
      updatedAt: Timestamp.now(),
    });

    await batch.commit();

    console.log("[markAnswerAsAccepted] Answer marked as accepted:", answerId);
  } catch (error) {
    console.error("[markAnswerAsAccepted] Error:", error);
    throw error;
  }
}

// ============================================================================
// VOTING OPERATIONS
// ============================================================================

/**
 * Vote on a question or answer
 * Users can upvote, downvote, or remove their vote
 * Each user can only vote once on each item
 *
 * @param itemId - The ID of the question or answer
 * @param itemType - Whether this is a question or answer
 * @param voteType - The type of vote (upvote, downvote, or null to remove vote)
 * @param userId - The ID of the user voting
 * @param questionId - The ID of the question (required for answers)
 * @returns Promise that resolves when vote is recorded
 */
export async function voteOnItem(
  itemId: string,
  itemType: "question" | "answer",
  voteType: VoteType,
  userId: string,
  questionId?: string,
): Promise<void> {
  try {
    console.log("[voteOnItem] Voting:", { itemId, itemType, voteType, userId });

    const db = getFirestoreInstance();
    const voteDocId = `${userId}_${itemId}`;
    const voteRef = doc(db, VOTES_COLLECTION, voteDocId);

    // Get current vote if exists
    const voteSnap = await getDoc(voteRef);
    const currentVote = voteSnap.exists()
      ? (voteSnap.data().voteType as VoteType)
      : null;

    // Calculate vote delta
    let voteDelta = 0;
    if (currentVote === "upvote" && voteType === "downvote") {
      voteDelta = -2; // Remove upvote and add downvote
    } else if (currentVote === "downvote" && voteType === "upvote") {
      voteDelta = 2; // Remove downvote and add upvote
    } else if (currentVote === "upvote" && voteType === null) {
      voteDelta = -1; // Remove upvote
    } else if (currentVote === "downvote" && voteType === null) {
      voteDelta = 1; // Remove downvote
    } else if (currentVote === null && voteType === "upvote") {
      voteDelta = 1; // Add upvote
    } else if (currentVote === null && voteType === "downvote") {
      voteDelta = -1; // Add downvote
    }

    // No change needed
    if (voteDelta === 0) {
      console.log("[voteOnItem] No change needed");
      return;
    }

    const batch = writeBatch(db);

    // Update or delete vote record
    if (voteType === null) {
      batch.delete(voteRef);
    } else {
      const voteData = {
        userId,
        itemId,
        itemType,
        voteType,
        createdAt: voteSnap.exists()
          ? voteSnap.data().createdAt
          : Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      batch.set(voteRef, voteData);
    }

    // Update vote count on the item
    if (itemType === "question") {
      const questionRef = doc(db, QUESTIONS_COLLECTION, itemId);
      batch.update(questionRef, {
        votes: increment(voteDelta),
      });
    } else {
      // Answer
      if (!questionId) {
        throw new Error("questionId is required for answer votes");
      }
      const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
      const answerRef = doc(questionRef, ANSWERS_COLLECTION, itemId);
      batch.update(answerRef, {
        votes: increment(voteDelta),
      });
    }

    await batch.commit();

    console.log("[voteOnItem] Vote recorded successfully");
  } catch (error) {
    console.error("[voteOnItem] Error:", error);
    throw error;
  }
}

/**
 * Get the current user's vote on an item
 *
 * @param itemId - The ID of the question or answer
 * @param userId - The ID of the user
 * @returns Promise resolving to the vote type or null if no vote
 */
export async function getUserVote(
  itemId: string,
  userId: string,
): Promise<VoteType> {
  try {
    const db = getFirestoreInstance();
    const voteDocId = `${userId}_${itemId}`;
    const voteRef = doc(db, VOTES_COLLECTION, voteDocId);

    const voteSnap = await getDoc(voteRef);

    if (voteSnap.exists()) {
      return voteSnap.data().voteType as VoteType;
    }

    return null;
  } catch (error) {
    console.error("[getUserVote] Error:", error);
    return null;
  }
}

/**
 * Get user votes for multiple items at once (for efficient loading)
 *
 * @param itemIds - Array of item IDs
 * @param userId - The ID of the user
 * @returns Promise resolving to map of itemId -> voteType
 */
export async function getUserVotes(
  itemIds: string[],
  userId: string,
): Promise<Map<string, VoteType>> {
  try {
    const db = getFirestoreInstance();
    const votes = new Map<string, VoteType>();

    // Fetch votes in parallel
    const votePromises = itemIds.map(async (itemId) => {
      const voteDocId = `${userId}_${itemId}`;
      const voteRef = doc(db, VOTES_COLLECTION, voteDocId);
      const voteSnap = await getDoc(voteRef);

      if (voteSnap.exists()) {
        votes.set(itemId, voteSnap.data().voteType as VoteType);
      } else {
        votes.set(itemId, null);
      }
    });

    await Promise.all(votePromises);

    return votes;
  } catch (error) {
    console.error("[getUserVotes] Error:", error);
    return new Map();
  }
}
