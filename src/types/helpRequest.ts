/**
 * Type definitions for help requests in the METU Help app
 */

export type HelpRequestCategory =
  | "medical"
  | "academic"
  | "transport"
  | "other";

export interface HelpRequest {
  id: string;
  title: string;
  category: HelpRequestCategory;
  description: string;
  location: string;
  isReturnNeeded: boolean;
  urgent: boolean;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "accepted" | "finalized" | "fulfilled" | "cancelled";
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedByEmail?: string;
  chatId?: string;
}

export interface CreateHelpRequestData {
  title: string;
  category: HelpRequestCategory;
  description: string;
  location: string;
  isReturnNeeded: boolean;
  urgent: boolean;
}
