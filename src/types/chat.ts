/**
 * Type definitions for chat functionality in the METU Help app
 */

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  createdAt: Date;
  system?: boolean; // Optional flag for system messages
}

export interface Chat {
  id: string;
  requestId: string;
  requestTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  helperId: string;
  helperName: string;
  helperEmail: string;
  members: string[]; // Array of user IDs who can access this chat
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
  status?: string; // Chat status: 'active', 'finalized'
}

export interface CreateChatData {
  requestId: string;
  requestTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  helperId: string;
  helperName: string;
  helperEmail: string;
}

export interface SendMessageData {
  text: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
}
