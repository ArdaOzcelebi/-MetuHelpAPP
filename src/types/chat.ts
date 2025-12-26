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
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
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
