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
} from "firebase/firestore";
import { getFirestoreInstance } from "@/src/firebase/firebaseConfig";

export interface QAQuestion {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
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
    console.error("[createQuestion] Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Subscribe to questions with real-time updates
 */
export function subscribeToQuestions(
  callback: (questions: QAQuestion[]) => void,
): () => void {
  console.log("[subscribeToQuestions] Setting up real-time listener");
  const db = getFirestoreInstance();
  const questionsRef = collection(db, "questions");
  const q = query(questionsRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(
        `[subscribeToQuestions] Received ${snapshot.docs.length} documents`,
      );
      const questions: QAQuestion[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[subscribeToQuestions] Document ${doc.id}:`, {
          title: data.title,
          createdAt: data.createdAt,
          hasTimestamp: !!data.createdAt,
        });
        questions.push({
          id: doc.id,
          title: data.title || "",
          body: data.body || "",
          authorName: data.authorName || "Anonymous",
          authorId: data.authorId || "",
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          answerCount: data.answerCount || 0,
        });
      });
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

  // Update answer count
  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    answerCount: increment(1),
  });
}
