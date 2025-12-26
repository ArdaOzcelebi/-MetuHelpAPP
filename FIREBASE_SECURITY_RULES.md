# Firebase Security Rules for METU Help App

## Required Firestore Security Rules

To enable the chat feature to work correctly, you need to update your Firebase security rules to include permissions for the messages subcollection.

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
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
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

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the **Rules** tab
5. Replace the existing rules with the rules above
6. Click **Publish**

## Testing the Rules

After updating, test the following scenarios:

1. ✅ User A creates a help request
2. ✅ User B offers help (creates chat)
3. ✅ User B sends a message (should work now)
4. ✅ User A opens the chat and sees the message
5. ✅ User A sends a reply (should work now)
6. ✅ Both users can see messages in real-time

## Security Considerations

The rules ensure:

- Only authenticated users can access chats
- Only chat members can read messages
- Only chat members can send messages
- Users can only send messages as themselves (via `senderId` check)
- Messages are immutable once created
- No one can delete messages

## Troubleshooting

If you still see permission errors:

1. Verify the rules are published in Firebase Console
2. Check that the `members` array in chat documents contains both user IDs
3. Verify that `senderId` in messages matches the authenticated user's UID
4. Check browser console for detailed error messages
5. Use Firebase Emulator for local testing with rules

## Data Structure Reference

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
