/**
 * TypeScript type definitions for firebaseConfig.js
 */

import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

/**
 * Get initialized Firebase Auth instance
 */
export function getAuthInstance(): Auth;

/**
 * Get Firebase Auth instance if available (non-throwing)
 */
export function getAuthIfAvailable(): Auth | undefined;

/**
 * Get initialized Firebase Firestore instance
 */
export function getFirestoreInstance(): Firestore;

/**
 * Get Firestore instance if available (non-throwing)
 */
export function getFirestoreIfAvailable(): Firestore | undefined;

/**
 * Check if Firebase configuration is available
 */
export const hasFirebaseConfig: boolean;

/**
 * Options for fetchHelpRequestsRealTime
 */
export interface FetchHelpRequestsOptions {
  category?: string;
  status?: string;
}

/**
 * Help request data structure
 */
export interface HelpRequestData {
  title: string;
  category: string;
  description?: string;
  location: string;
  isReturnNeeded?: boolean;
  urgent?: boolean;
}

/**
 * Subscribe to help requests with real-time updates
 */
export function fetchHelpRequestsRealTime(
  callback: (requests: any[]) => void,
  options?: FetchHelpRequestsOptions,
): () => void;

/**
 * Add a new help request to Firestore
 */
export function addHelpRequest(
  data: HelpRequestData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string>;

/**
 * Options for fetchQuestionsRealTime
 */
export interface FetchQuestionsOptions {
  status?: string;
}

/**
 * Question data structure
 */
export interface QuestionData {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Subscribe to questions with real-time updates
 */
export function fetchQuestionsRealTime(
  callback: (questions: any[]) => void,
  options?: FetchQuestionsOptions,
): () => void;

/**
 * Add a new question to Firestore
 */
export function addQuestion(
  data: QuestionData,
  userId: string,
  userEmail: string,
  userName: string,
): Promise<string>;

/**
 * Firebase connection status
 */
export interface FirebaseConnectionStatus {
  success: boolean;
  auth: boolean;
  firestore: boolean;
  error?: string;
  message: string;
}

/**
 * Test Firebase connection and configuration
 */
export function testFirebaseConnection(): Promise<FirebaseConnectionStatus>;
