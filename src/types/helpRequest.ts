/**
 * Type definitions for help requests in the METU Help app
 *
 * Field Mapping Notes:
 * - 'title' field represents the 'item' in requirements (what the user needs)
 * - 'isReturnNeeded' maps to 'needReturn' in requirements
 */

export type HelpRequestCategory =
  | "medical"
  | "academic"
  | "transport"
  | "other";

export interface HelpRequest {
  id: string;
  title: string; // Maps to 'item' in requirements - what the user needs
  category: HelpRequestCategory;
  description: string;
  location: string;
  isReturnNeeded: boolean; // Maps to 'needReturn' in requirements
  urgent: boolean;
  isAnonymous: boolean; // Whether the request was posted anonymously
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "fulfilled" | "cancelled";
}

export interface CreateHelpRequestData {
  title: string; // Maps to 'item' in requirements
  category: HelpRequestCategory;
  description: string;
  location: string;
  isReturnNeeded: boolean; // Maps to 'needReturn' in requirements
  urgent: boolean;
  isAnonymous?: boolean; // Optional - defaults to false
}
