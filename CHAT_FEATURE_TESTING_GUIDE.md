# Chat Feature Testing Guide

## Overview
This document describes how to test the new chat functionality that enables requesters to access chats created when helpers offer assistance.

## Test Environment Setup

### Prerequisites
1. Two test accounts (User A and User B)
2. Firebase configured with proper authentication
3. Firestore database with collections: `helpRequests` and `chats`

## Test Scenarios

### Scenario 1: Helper Creates Chat
**Objective**: Verify that a helper can offer help and create a chat

**Steps**:
1. Log in as User A (Requester)
2. Navigate to "Need Help" screen
3. Tap the "+" button to create a new request
4. Fill in the request details:
   - Title: "Need a notebook"
   - Category: Academic
   - Location: Library
   - Description: "Lost my notebook, need to borrow one"
   - Mark as urgent
5. Submit the request
6. Log out

7. Log in as User B (Helper)
8. Navigate to "Need Help" screen
9. Find User A's request in the list
10. Tap on the request card to view details
11. Tap "I Can Help" button

**Expected Results**:
- ✅ Chat document is created in Firestore (`chats` collection)
- ✅ User B is navigated to ChatScreen
- ✅ Chat header shows request title and "Chat with [User A]"
- ✅ Green online indicator appears in chat header
- ✅ Empty state message: "No messages yet. Start the conversation!"
- ✅ Message input is ready for typing
- ✅ Console logs show: `[RequestDetailScreen] Chat created successfully: [chatId]`

### Scenario 2: Requester Accesses Chat (The Fix)
**Objective**: Verify that the requester can see and access the chat

**Steps**:
1. Still logged in as User B, send a message: "Hi! I have a notebook you can borrow"
2. Log out

3. Log in as User A (Requester)
4. Navigate to "Need Help" screen
5. Look at your own request in the list

**Expected Results**:
- ✅ Request card shows "Open Chat" button instead of "I Can Help"
- ✅ "Open Chat" button has a message icon
- ✅ Button color is METU maroon (not green)
- ✅ Console logs show: `[NeedHelpScreen] Checking active chats for Request ID: ...`
- ✅ Console logs show: `[NeedHelpScreen] Found active chat for request: ... chatId: ...`

**Steps** (continued):
6. Tap "Open Chat" button

**Expected Results**:
- ✅ User A is navigated to the same ChatScreen
- ✅ User A can see User B's message: "Hi! I have a notebook you can borrow"
- ✅ Chat header shows "Chat with [User B]"
- ✅ Console logs show: `[ChatScreen] Listening to messages for Chat ID: ...`
- ✅ Console logs show: `[ChatScreen] Message received: ...`

### Scenario 3: Real-time Messaging
**Objective**: Verify messages update in real-time without refresh

**Setup**: Keep both users logged in on different devices/browsers

**Steps**:
1. As User A, type: "Great! When can we meet?"
2. Tap send button (or press Enter)

**Expected Results on User A's device**:
- ✅ Message appears immediately in the chat
- ✅ Message bubble is on the right (own message)
- ✅ Background color is METU maroon
- ✅ Text is white
- ✅ Timestamp appears below message
- ✅ FlatList auto-scrolls to show new message
- ✅ Input field is cleared
- ✅ Send button is disabled while sending
- ✅ Console logs show: `[ChatScreen] Message received: ...`

**Expected Results on User B's device (REAL-TIME)**:
- ✅ Message appears WITHOUT refresh
- ✅ Message bubble is on the left (other's message)
- ✅ Background color is card background (light gray)
- ✅ Text is default text color
- ✅ Sender name "User A" appears above message
- ✅ Timestamp appears below message
- ✅ FlatList auto-scrolls to show new message
- ✅ Smooth fade-in animation plays
- ✅ Console logs show: `[ChatScreen] Received message update, count: 2`

**Steps** (continued):
3. As User B, type: "How about in 10 minutes?"
4. Tap send

**Expected Results**:
- ✅ User A sees the message immediately (no refresh needed)
- ✅ Conversation flows naturally back and forth
- ✅ All messages stay in chronological order (newest at bottom)

### Scenario 4: Character Counter
**Objective**: Verify character counter appears for long messages

**Steps**:
1. As either user, start typing a long message
2. Type more than 400 characters

**Expected Results**:
- ✅ Character counter appears: "450/500"
- ✅ Counter is positioned at bottom-right of input
- ✅ Counter is gray when under 500
- ✅ Counter turns red when at 500
- ✅ Cannot type more than 500 characters

### Scenario 5: Keyboard Handling
**Objective**: Verify keyboard interactions work smoothly

**Steps**:
1. Tap in the message input field
2. Type a message
3. Press Enter/Return key

**Expected Results**:
- ✅ Message is sent (same as tapping send button)
- ✅ Keyboard stays open for next message
- ✅ Input field is cleared
- ✅ FlatList adjusts for keyboard
- ✅ Bottom of chat is still visible

### Scenario 6: Empty State
**Objective**: Verify empty state displays correctly

**Steps**:
1. Create a new chat (follow Scenario 1)
2. Before sending any messages, observe the chat screen

**Expected Results**:
- ✅ Message circle icon appears in center
- ✅ Text: "No messages yet. Start the conversation!"
- ✅ Icon and text are centered vertically
- ✅ Input field is still accessible at bottom

### Scenario 7: Error Handling
**Objective**: Verify error handling for missing chatId

**Steps**:
1. Manually navigate to Chat screen with invalid/missing chatId
   (This would require direct navigation or URL manipulation)

**Expected Results**:
- ✅ Error icon (alert-circle) appears
- ✅ Error message: "Chat ID not found"
- ✅ Subtitle: "Unable to load this conversation. Please try again."
- ✅ No crash or blank screen

### Scenario 8: Preventing Self-Help
**Objective**: Verify users cannot help their own requests

**Steps**:
1. Log in as User A (Requester)
2. Navigate to "Need Help" screen
3. Find your own request
4. Tap on it to view details
5. Tap "I Can Help" button

**Expected Results**:
- ✅ Alert appears: "Cannot Help"
- ✅ Message: "You cannot offer help on your own request."
- ✅ No chat is created
- ✅ User stays on RequestDetailScreen

### Scenario 9: Duplicate Chat Prevention
**Objective**: Verify duplicate chats are not created

**Steps**:
1. Complete Scenario 1 (Helper creates chat)
2. User B navigates away from chat
3. User B goes back to the request detail
4. User B taps "I Can Help" again

**Expected Results**:
- ✅ No new chat is created
- ✅ User B is navigated to the existing chat
- ✅ All previous messages are visible
- ✅ Console logs show: `[RequestDetailScreen] Using existing chat: [chatId]`

### Scenario 10: Chat Persistence
**Objective**: Verify chats persist across app restarts

**Steps**:
1. Complete Scenario 2 (send messages back and forth)
2. Close the app (force quit)
3. Reopen the app
4. Log in as User A
5. Navigate to "Need Help"
6. Tap "Open Chat" on the request

**Expected Results**:
- ✅ All previous messages are still visible
- ✅ Messages are in correct order
- ✅ Can send new messages
- ✅ Real-time updates still work

## Visual Verification Checklist

### NeedHelpScreen
- [ ] "Open Chat" button appears for requester's own requests (when chat exists)
- [ ] "I Can Help" button appears for other users' requests
- [ ] Message icon appears on "Open Chat" button
- [ ] Button colors are correct (maroon for Open Chat, green for I Can Help)
- [ ] Smooth animations when pressing buttons

### RequestDetailScreen
- [ ] "I Can Help" button shows loading spinner while creating chat
- [ ] Button is disabled while loading
- [ ] Smooth navigation to ChatScreen after chat creation

### ChatScreen
- [ ] Chat header displays request title
- [ ] Chat header displays "Chat with [name]"
- [ ] Green online indicator dot appears
- [ ] Own messages appear on right with maroon background
- [ ] Other's messages appear on left with gray background
- [ ] Sender name appears on other's messages
- [ ] Timestamps are formatted correctly
- [ ] Messages fade in smoothly
- [ ] FlatList auto-scrolls to newest message
- [ ] Character counter appears above 400 characters
- [ ] Character counter turns red at 500 characters
- [ ] Send button is disabled when input is empty
- [ ] Send button shows loading spinner while sending
- [ ] Empty state looks good
- [ ] Error state looks good

## Console Log Verification

Watch for these console logs during testing:

### NeedHelpScreen
```
[NeedHelpScreen] Setting up subscription for category: all
[NeedHelpScreen] Received requests update, count: X
[NeedHelpScreen] Checking active chats for Request ID: abc123
[NeedHelpScreen] Found active chat for request: abc123 chatId: xyz789
[NeedHelpScreen] Opening chat: xyz789
```

### RequestDetailScreen
```
[RequestDetailScreen] Creating new chat for request: abc123
[RequestDetailScreen] Chat created successfully: xyz789
OR
[RequestDetailScreen] Using existing chat: xyz789
```

### ChatScreen
```
[ChatScreen] Listening to messages for Chat ID: xyz789
[ChatScreen] Setting up message subscription for chat: xyz789
[ChatScreen] Received message update, count: 1
[ChatScreen] Message received: {id, text, senderId, ...}
[ChatScreen] Message sent successfully
[ChatScreen] Cleaning up message subscription
```

### ChatService
```
[createChat] Starting with input: {...}
[createChat] Successfully created with ID: xyz789
[getChatByRequestId] Checking for chat with requestId: abc123
[getChatByRequestId] Found documents: 1
[getChatByRequestId] Returning chat: xyz789
[subscribeToMessages] Snapshot received, message count: 2
[sendMessage] Sending message to chat: xyz789
[sendMessage] Message sent successfully
```

## Performance Verification

- [ ] Chat loads in under 2 seconds
- [ ] Messages appear instantly (under 500ms delay)
- [ ] No lag when typing in input field
- [ ] Smooth scrolling in message list
- [ ] No memory leaks (subscriptions cleaned up)
- [ ] App doesn't crash with 100+ messages

## Accessibility Verification

- [ ] All buttons have proper touch targets (44x44pt minimum)
- [ ] Text is readable in both light and dark mode
- [ ] Color contrast meets WCAG standards
- [ ] VoiceOver/TalkBack can navigate the chat
- [ ] Screen readers announce new messages

## Edge Cases

### Multiple Helpers
**Test**: What happens if multiple users try to help the same request?
**Expected**: Each user should get their own chat with the requester

### Rapid Message Sending
**Test**: Send 10 messages very quickly
**Expected**: All messages appear in order, no duplicates, no lost messages

### Network Offline
**Test**: Send message with network disconnected
**Expected**: Error handling, message queues or shows error

### Very Long Messages
**Test**: Send message at exactly 500 characters
**Expected**: Message sends successfully

### Special Characters
**Test**: Send message with emojis, special characters
**Expected**: All characters display correctly

## Firestore Structure Verification

After testing, verify Firestore has the correct structure:

```
chats/
  {chatId}/
    requestId: "abc123"
    requestTitle: "Need a notebook"
    requesterId: "userA_uid"
    requesterName: "User A"
    requesterEmail: "usera@metu.edu.tr"
    helperId: "userB_uid"
    helperName: "User B"
    helperEmail: "userb@metu.edu.tr"
    createdAt: Timestamp
    updatedAt: Timestamp
    lastMessage: "Great! When can we meet?"
    lastMessageAt: Timestamp
    
    messages/
      {messageId1}/
        chatId: {chatId}
        senderId: "userB_uid"
        senderName: "User B"
        senderEmail: "userb@metu.edu.tr"
        text: "Hi! I have a notebook you can borrow"
        createdAt: Timestamp
      
      {messageId2}/
        chatId: {chatId}
        senderId: "userA_uid"
        senderName: "User A"
        senderEmail: "usera@metu.edu.tr"
        text: "Great! When can we meet?"
        createdAt: Timestamp
```

## Bug Reporting Template

If you find any issues, report them with this format:

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Console Logs**:
[Paste relevant console output]

**Screenshots**:
[Attach screenshots if applicable]

**Device/Browser**:
[iOS 17, Android 14, Chrome, etc.]
```

## Success Criteria

All test scenarios should pass:
- ✅ Scenario 1: Helper Creates Chat
- ✅ Scenario 2: Requester Accesses Chat (The Fix)
- ✅ Scenario 3: Real-time Messaging
- ✅ Scenario 4: Character Counter
- ✅ Scenario 5: Keyboard Handling
- ✅ Scenario 6: Empty State
- ✅ Scenario 7: Error Handling
- ✅ Scenario 8: Preventing Self-Help
- ✅ Scenario 9: Duplicate Chat Prevention
- ✅ Scenario 10: Chat Persistence

All visual elements should look polished and professional.
All console logs should appear as expected.
No errors in console.
No security vulnerabilities.
