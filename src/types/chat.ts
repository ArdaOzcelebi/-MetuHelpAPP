/**
 * Type definitions for chat functionality in the METU Help app
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  requestId: string;
  requestTitle: string;
  members: string[]; // Array of user IDs [requesterId, accepterId]
  memberNames: {
    [userId: string]: string;
  };
  memberEmails: {
    [userId: string]: string;
  };
  messages: Message[];
  status: "active" | "finalized";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatData {
  requestId: string;
  requestTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  accepterId: string;
  accepterName: string;
  accepterEmail: string;
}

export interface SendMessageData {
  message: string;
}
