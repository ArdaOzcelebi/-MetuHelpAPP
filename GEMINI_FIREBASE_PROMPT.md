# Gemini Prompt: Configure Firebase for Chat Feature

## Context

I have a React Native app (METU Help) that allows users to accept help requests and chat in real-time. The app uses Firebase Firestore for data storage. I need to configure Firestore security rules to enable the chat feature.

## Current Collections

1. **helpRequests** - Stores help requests
   - Fields: `userId`, `status` (active/accepted/finalized), `acceptedBy`, `chatId`, etc.
   
2. **chats** - Stores chat conversations (NEW)
   - Fields: `members` (array of user IDs), `messages` (array), `status`, etc.

## What I Need

Please provide the complete Firestore security rules that:

1. Allow authenticated users to read all active help requests
2. Allow users to create help requests
3. Allow users to update help requests when:
   - They are the creator, OR
   - They are accepting the request (changing status from "active" to "accepted"), OR
   - They are the accepter finalizing the request
4. Allow users to read chats only if they are members
5. Allow users to create chats if they will be members
6. Allow users to update chats (send messages) only if they are members
7. Prevent deletion of chats for record-keeping

## Required Output

Provide the complete `firestore.rules` file that I can copy and paste into Firebase Console.

## Additional Notes

- Project ID: metuhelpapp
- Auth provider: Firebase Authentication
- All operations require authentication (`request.auth != null`)

## Example Request Flow

1. User A creates a help request (status: "active")
2. User B accepts the request:
   - Creates a chat document with members: [userA_id, userB_id]
   - Updates help request with: status="accepted", acceptedBy=userB_id, chatId=chat_id
3. Both users can send messages to the chat
4. Either user can finalize the request (status: "finalized")

Please provide the rules that make this flow work securely.
