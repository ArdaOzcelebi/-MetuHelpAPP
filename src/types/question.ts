/**
 * Type definitions for Q&A forum in the METU Help app
 *
 * This file defines the data structures for questions, answers, and votes
 * used in the Q&A forum feature.
 */

/**
 * Question entity stored in Firestore
 */
export interface Question {
  id: string;
  title: string; // Short, descriptive title of the question
  body: string; // Detailed explanation or context (optional in form, stored as empty string)
  tags: string[]; // Tags to categorize the question (e.g., "housing", "study materials")
  createdAt: Date; // When the question was asked
  updatedAt: Date; // When the question was last modified
  author: {
    uid: string; // User ID of the author
    name: string; // Display name of the author
    email: string; // Email of the author
  };
  votes: number; // Net votes (upvotes - downvotes)
  answerCount: number; // Number of answers to this question
  hasAcceptedAnswer: boolean; // Whether an answer has been accepted
  status: "open" | "closed"; // Status of the question
}

/**
 * Data required to create a new question
 */
export interface CreateQuestionData {
  title: string;
  body?: string; // Optional detailed explanation
  tags?: string[]; // Optional tags
}

/**
 * Answer entity stored as subcollection under questions
 */
export interface Answer {
  id: string;
  body: string; // Content of the answer
  author: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  votes: number; // Net votes for this answer
  accepted: boolean; // Whether this is the accepted answer
  questionId: string; // Reference to parent question
}

/**
 * Data required to create a new answer
 */
export interface CreateAnswerData {
  body: string;
}

/**
 * Vote types
 */
export type VoteType = "upvote" | "downvote" | null;

/**
 * Vote entity to track user votes
 * Stored in votes collection with composite key userId_itemId
 */
export interface Vote {
  userId: string; // ID of user who voted
  itemId: string; // ID of question or answer
  itemType: "question" | "answer"; // Type of item being voted on
  voteType: VoteType; // Type of vote (upvote, downvote, or null for removed vote)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filter options for querying questions
 */
export interface QuestionFilters {
  tags?: string[]; // Filter by specific tags
  searchQuery?: string; // Search in title and body
  sortBy?: "recent" | "popular" | "unanswered"; // Sort order
  status?: "open" | "closed"; // Filter by status
}
