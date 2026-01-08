# Firebase Security Rules for METU Help App

## Required Firestore Security Rules

To enable the chat feature and post deletion feature to work correctly, you need to update your Firebase security rules.

**IMPORTANT**: After implementing the post deletion feature, you must update your Firestore security rules to allow users to delete their own posts. Without these rules, you will see "Missing or insufficient permissions" errors when trying to delete.

### Complete Security Rules

Replace your current Firestore security rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Help Requests Collection
    match /helpRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == request.resource.data.acceptedBy ||
        resource.data.status == "active"
      );
      // Allow delete only by the request owner
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Questions Collection (Q&A Forum)
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
      allow update: if request.auth != null && request.auth.uid == resource.data.authorId;
      // Allow delete only by the question author
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
      
      // Answers Subcollection
      match /answers/{answerId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && request.auth.uid == request.resource.data.authorId;
        allow update: if request.auth != null && request.auth.uid == resource.data.authorId;
        // Allow delete only by the answer author
        allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
      }
    }
    
    // Chats Collection
    match /chats/{chatId} {
      // Allow read/write if user is a member of the chat
      allow read: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null && request.auth.uid in request.resource.data.members;
      allow update: if request.auth != null && request.auth.uid in resource.data.members;
      allow delete: if false;
      
      // Messages Subcollection (REQUIRED FOR CHAT TO WORK)
      match /messages/{messageId} {
        // Allow read if user is a member of the parent chat
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
        
        // Allow create if user is a member of the parent chat AND is the sender
        allow create: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members &&
                         request.auth.uid == request.resource.data.senderId;
        
        // Messages cannot be updated or deleted
        allow update: if false;
        allow delete: if false;
      }
    }
  }
}
```

## What Changed?

### Added Questions Collection Rules (Q&A Forum)

New rules have been added for the `questions` collection to support the Q&A Forum feature:

1. **Question Documents**: Users can create, read, update, and delete their own questions
   - `allow delete: if request.auth != null && request.auth.uid == resource.data.authorId`
   - This ensures only the question author can delete their questions

2. **Answers Subcollection**: Users can create, read, update, and delete their own answers
   - `allow delete: if request.auth != null && request.auth.uid == resource.data.authorId`
   - This ensures only the answer author can delete their answers

### Updated Help Requests Collection

The `helpRequests` collection already had delete rules, which allow:
- **Delete requests**: Only the request owner can delete their help requests
  - `allow delete: if request.auth != null && request.auth.uid == resource.data.userId`

### Added Messages Subcollection Rules

The key addition is the `match /messages/{messageId}` block inside the chats collection. This allows:

1. **Read messages**: Any user who is a member of the parent chat can read all messages in that chat
2. **Create messages**: Users can create messages if they are:
   - A member of the parent chat (checked via `get()` function)
   - The sender of the message (checked via `senderId` field)
3. **No updates/deletes**: Messages cannot be modified or deleted once created

### Why This Was Needed

The original rules only covered the top-level `chats` collection but didn't have rules for the `messages` subcollection. Without explicit rules for subcollections, Firestore denies all access by default, which caused the "Missing or insufficient permissions" error when trying to send messages.

## How to Update Rules

**CRITICAL**: These rules must be added to **Firebase Console** (the website), NOT just this file!

### Visual Guide:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Open Browser → https://console.firebase.google.com/    │
│  2. Click your project                                      │
│  3. Left Menu → Click "Firestore Database"                 │
│  4. Top Tabs → Click "Rules" (NOT "Data")                  │
│  5. Copy rules from lines 13-75 of this file               │
│  6. Paste into the editor on Firebase Console              │
│  7. Click "Publish" button                                  │
│  8. Wait for "Rules published successfully" ✓              │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** (in left sidebar)
4. Click on the **Rules** tab (at the top, next to "Data", "Indexes", etc.)
5. **COPY** all the rules from lines 13-75 above (starting with `rules_version = '2';`)
6. **PASTE** into the Firebase Console rules editor (replace everything)
7. Click **Publish** button (bottom right)
8. Wait for confirmation message: "Rules published successfully"

⚠️ **IMPORTANT**: Editing this markdown file does NOT update Firebase! You MUST use the Firebase Console website.

## Testing the Rules

After updating, test the following scenarios:

### Chat Feature
1. ✅ User A creates a help request
2. ✅ User B offers help (creates chat)
3. ✅ User B sends a message (should work now)
4. ✅ User A opens the chat and sees the message
5. ✅ User A sends a reply (should work now)
6. ✅ Both users can see messages in real-time

### Deletion Feature
1. ✅ User A creates a question
2. ✅ User A can delete their own question
3. ❌ User B cannot delete User A's question (should fail)
4. ✅ User A creates a help request
5. ✅ User A can delete their own help request (if not accepted)
6. ❌ User B cannot delete User A's help request (should fail)

## Security Considerations

The rules ensure:

### Chat Security
- Only authenticated users can access chats
- Only chat members can read messages
- Only chat members can send messages
- Users can only send messages as themselves (via `senderId` check)
- Messages are immutable once created
- No one can delete messages

### Q&A Forum Security
- Only authenticated users can access questions and answers
- Users can only delete their own questions
- Users can only delete their own answers
- Question authors control their content lifecycle

### Help Requests Security
- Only authenticated users can access help requests
- Users can only delete their own help requests
- Request owners control their content lifecycle

## Troubleshooting

### "Missing or insufficient permissions" Error

If you still see this error when trying to delete:

**IMPORTANT**: You must update the rules in **Firebase Console** (the website), not just this markdown file!

#### Step-by-Step Verification:

1. **Verify Rules Are Published in Firebase Console**
   - Go to https://console.firebase.google.com/
   - Select your project
   - Click "Firestore Database" in the left menu
   - Click the "Rules" tab (NOT "Data" tab)
   - Check if your rules include the delete permissions shown above
   - If not, copy ALL the rules from lines 13-75 above
   - Paste them into the Firebase Console Rules editor
   - Click "Publish" button
   - Wait for "Rules published successfully" message

2. **Verify the Document Structure**
   - In Firebase Console → Firestore Database → Data tab
   - Open a help request document
   - Verify it has a `userId` field with your user's UID
   - The `userId` must exactly match the authenticated user's UID

3. **Check Authentication**
   - Verify you are logged in (check browser console for `user.uid`)
   - Your user must be authenticated via Firebase Auth
   - The `request.auth.uid` must match the document's `userId`

4. **Common Mistakes**
   - ❌ Editing this markdown file only (doesn't affect Firebase)
   - ❌ Not clicking "Publish" after updating rules
   - ❌ Having typos in the rules (check console for syntax errors)
   - ❌ Being logged in with a different account than the one who created the post

5. **Test Your Rules in Rules Playground**
   - In Firebase Console → Firestore Database → Rules tab
   - Click "Rules Playground" button
   - Configure the test:
     - **Location**: `/databases/(default)/documents/helpRequests/testRequestId`
     - **Operation**: Select "delete"
     - **Authenticated**: ✓ Check this box
     - **Auth UID**: Enter your user ID (get from browser console: `user.uid`)
   - **CRITICAL**: Add mock document data (click "+ Add" under "Firestore data"):
     ```
     Field: userId
     Type: string
     Value: (same user ID as Auth UID above)
     ```
   - Click "Run" button
   - Should show ✅ "Simulated delete allowed"
   
   **Common Playground Errors:**
   - ❌ "Null value error" = You forgot to add mock document data
   - ❌ "Permission denied" = The `userId` in mock data doesn't match Auth UID
   - ❌ "Authenticated" unchecked = Must check "Authenticated" box

### Other Troubleshooting Steps

1. Check that the `members` array in chat documents contains both user IDs
2. Verify that `senderId` in messages matches the authenticated user's UID
3. Check browser console for detailed error messages
4. Use Firebase Emulator for local testing with rules

### If Rules Playground Shows "Null value error"

This error occurs when testing delete operations in Rules Playground without mock data:

**Problem**: The rule checks `resource.data.userId`, but there's no document data in the playground by default.

**Solution**: Add mock document data in Rules Playground:
1. In the "Firestore data" section, click "+ Add"
2. Add these fields:
   - `userId` (string): Your user ID
   - `title` (string): "Test Request"
   - `status` (string): "active"
3. Make sure the `userId` value matches your "Auth UID" field above
4. Click "Run" - should now work without null error

## Data Structure Reference

### Help Request Document
```typescript
helpRequests/{requestId}
  - userId: string          // REQUIRED - must match auth.uid for delete
  - userEmail: string
  - userName: string
  - title: string
  - category: string
  - description: string
  - location: string
  - isReturnNeeded: boolean
  - urgent: boolean
  - isAnonymous: boolean
  - status: string          // "active" | "accepted" | "finalized"
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - acceptedBy?: string
  - acceptedByName?: string
  - acceptedByEmail?: string
  - chatId?: string
```

### Chat Document
```typescript
chats/{chatId}
  - requestId: string
  - requestTitle: string
  - requesterId: string
  - requesterName: string
  - requesterEmail: string
  - helperId: string
  - helperName: string
  - helperEmail: string
  - members: [requesterId, helperId]  // REQUIRED for security rules
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - lastMessage: string
  - lastMessageAt: Timestamp
```

### Message Document
```typescript
chats/{chatId}/messages/{messageId}
  - chatId: string
  - senderId: string  // REQUIRED - must match auth.uid
  - senderName: string
  - senderEmail: string
  - text: string
  - createdAt: Timestamp
```

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Security Rules Reference](https://firebase.google.com/docs/reference/security/database)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)
