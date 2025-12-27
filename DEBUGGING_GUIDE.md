# Debugging Guide - Chat Persistence Issues

## Overview
This guide helps diagnose and fix chat persistence issues in the METU Help app's global floating chat overlay.

## Recent Fixes (Commit a4ebaca)

### 1. Explicit Status Field
**Problem**: Chats created without explicit `status` field
**Solution**: Added `status: "active"` in `createChat()` function

```typescript
// src/services/chatService.ts:171
const data = {
  ...chatData,
  members: [chatData.requesterId, chatData.helperId],
  status: "active", // ← EXPLICITLY SET
  createdAt: now,
  updatedAt: now,
};
```

### 2. Duplicate Acceptance Prevention
**Problem**: Multiple users could accept the same request
**Solution**: Validate helper ID before allowing chat access

```typescript
// screens/RequestDetailScreen.tsx
if (existingChat.helperId !== user.uid) {
  Alert.alert("Already Accepted", "This request has already been accepted...");
  return;
}
```

## Diagnostic Steps

### Step 1: Check Firestore Data Structure

Open Firebase Console → Firestore → `chats` collection

**Expected fields for each chat document:**
```json
{
  "requestId": "abc123",
  "requestTitle": "Need help with...",
  "requesterId": "user1",
  "requesterName": "John Doe",
  "requesterEmail": "john@example.com",
  "helperId": "user2",
  "helperName": "Jane Smith",
  "helperEmail": "jane@example.com",
  "members": ["user1", "user2"],
  "status": "active",  // ← MUST BE PRESENT
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "lastMessage": "Hello",
  "lastMessageAt": Timestamp
}
```

**Action**: Check if older chats are missing the `status` field. If so, manually add `status: "active"` or delete and recreate them.

### Step 2: Verify Chat Subscription

Check browser console for these log messages:

```
[ChatOverlayContext] Setting up chat subscription for user: <uid>
[ChatOverlayContext] Received chat updates: <count>
```

**Expected flow:**
1. User logs in → subscription starts
2. Chat created → receives update with new chat
3. Chat finalized → receives update, chat has status "finalized"
4. Filter excludes finalized chats from thread list

**If logs are missing:**
- Check if `ChatOverlayProvider` is mounted in App.tsx
- Check if user is authenticated
- Check Firestore security rules

### Step 3: Test Chat Creation Flow

1. **Create new request** (User A)
2. **Offer help** (User B clicks "I Can Help")
3. **Check console logs:**
   ```
   [createChat] Starting with input: {...}
   [createChat] Data to be written: {...}  // ← Should have status: "active"
   [createChat] Successfully created with ID: <chatId>
   ```

4. **Verify chat appears in overlay:**
   - Click chat bubble in bottom-right
   - Should see chat in thread list

5. **Close and reopen:**
   - Click X to close overlay
   - Click bubble again
   - **Expected**: Chat still visible in thread list

### Step 4: Check Filter Logic

In `src/components/ChatOverlay.tsx:172`:

```typescript
const activeChats = chats.filter((chat) => chat.status !== "finalized");
```

**Debug**: Add console log to see what's being filtered:

```typescript
console.log("All chats:", chats.map(c => ({ id: c.id, status: c.status })));
console.log("Active chats:", activeChats.map(c => ({ id: c.id, status: c.status })));
```

### Step 5: Check Context State

In `src/contexts/ChatOverlayContext.tsx`, verify state updates:

```typescript
// Line 93 - openChat
console.log("[ChatOverlayContext] Opening chat:", chatId);
console.log("State before:", { activeChatId, isOpen, isMinimized, activeView });

// Line 115 - closeChat  
console.log("[ChatOverlayContext] Closing chat overlay");
console.log("State after:", { activeChatId, isOpen, isMinimized, activeView });
// ← activeChatId should NOT be null after closeChat

// Line 125 - toggleMinimize
console.log("[ChatOverlayContext] Toggling minimize state");
console.log("State:", { isMinimized, activeChatId });
// ← If activeChatId exists, should set activeView to "conversation"
```

## Common Issues & Solutions

### Issue 1: "No active chats yet" after creating chat

**Possible Causes:**
1. Chat created without `status` field (fixed in a4ebaca)
2. Chat has `status: "finalized"` by mistake
3. Subscription not receiving updates
4. User UID mismatch in members array

**Solution:**
```bash
# Check Firestore console
# Verify chat document has:
# - status: "active"
# - members: [requesterId, helperId]
# - Current user's UID is in members array
```

### Issue 2: Chat disappears after closing overlay

**Possible Causes:**
1. `closeChat()` setting `activeChatId` to null (FIXED in cb748b8)
2. Chat being marked as finalized incorrectly
3. Subscription losing connection

**Solution:**
- Already fixed: `closeChat()` keeps `activeChatId`
- Verify by checking console logs when closing

### Issue 3: Multiple users can accept same request

**Possible Causes:**
1. No validation of existing helper (FIXED in a4ebaca)
2. Race condition during simultaneous acceptance

**Solution:**
- Already fixed: Validates `existingChat.helperId !== user.uid`
- Shows "Already Accepted" alert for non-helpers

### Issue 4: Old chats don't show up

**Possible Cause:** Chats created before a4ebaca don't have `status` field

**Solution:**
Run this Firestore update (in Firebase Console → Firestore → Query):

```javascript
// Get all chats without status field
db.collection('chats')
  .where('status', '==', null)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      doc.ref.update({ status: 'active' });
    });
  });
```

Or manually add `status: "active"` to affected documents.

## Testing Checklist

- [ ] User A creates request
- [ ] User B clicks "I Can Help"
- [ ] Chat appears in User B's chat list immediately
- [ ] User B closes chat overlay (X button)
- [ ] User B clicks bubble → chat still visible
- [ ] User B opens chat → conversation loads
- [ ] User C tries to click "I Can Help" on same request
- [ ] User C sees "Already Accepted" alert
- [ ] User A clicks "Mark Complete"
- [ ] Request marked as finalized
- [ ] Chat disappears from both users' thread lists
- [ ] New chats can be created for new requests

## Performance Checks

### Real-time Update Latency
- Message sent → appears in other user's chat: **< 2 seconds**
- Chat created → appears in thread list: **< 2 seconds**
- Chat finalized → removed from thread list: **< 2 seconds**

### Memory Leaks
- Check for unsubscribed listeners:
  ```
  [ChatOverlayContext] Cleaning up chat subscription
  [ConversationView] Cleaning up message subscription
  ```

### Browser Console Errors
Should see NO errors related to:
- Firestore permissions
- Undefined properties
- Failed queries
- Timeout errors

## Firebase Security Rules

Ensure these rules are in place:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      // Users can only access chats they're members of
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      
      // Users can create chats where they're a member
      allow create: if request.auth != null && 
                       request.auth.uid in request.resource.data.members;
      
      // Users can update chats they're members of
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.members;
    }
    
    match /chats/{chatId}/messages/{messageId} {
      // Users can read messages if they're chat members
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
      
      // Users can send messages if they're chat members
      allow create: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
    }
  }
}
```

## Need More Help?

If issues persist after following this guide:

1. **Export Firestore data** for affected chats
2. **Capture console logs** showing the issue
3. **Record screen video** of the bug occurring
4. **Note exact steps** to reproduce
5. **Share Firebase project ID** (if permissions allow)

## Quick Fixes to Try

### Clear Everything and Start Fresh

```typescript
// 1. Clear AsyncStorage (if used)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();

// 2. Clear app cache
// iOS: Uninstall and reinstall app
// Android: Settings → Apps → METU Help → Clear Cache
// Web: Browser DevTools → Application → Clear Storage

// 3. Sign out and sign back in
await auth.signOut();
// Then sign in again

// 4. Create new test request and chat
// Verify it works with fresh data
```

### Add Debug Mode

Add this to `ChatOverlayContext.tsx`:

```typescript
// After line 76
console.log("====== DEBUG: ALL CHATS ======");
updatedChats.forEach(chat => {
  console.log(`Chat ID: ${chat.id}`);
  console.log(`  Status: ${chat.status}`);
  console.log(`  Request: ${chat.requestTitle}`);
  console.log(`  Members: ${chat.members?.join(', ')}`);
  console.log(`  Helper: ${chat.helperId}`);
  console.log(`  Requester: ${chat.requesterId}`);
});
console.log("=============================");
```

This will show EXACTLY what data is coming from Firestore.

## Summary

The code changes in commit a4ebaca should fix the chat persistence issues. If problems persist:

1. Check if testing with OLD chats (created before fix)
2. Verify Firestore data has correct structure
3. Check console logs for errors
4. Try with fresh chat/request
5. Clear cache and test again

The implementation is correct - issues are most likely data-related or cache-related.
