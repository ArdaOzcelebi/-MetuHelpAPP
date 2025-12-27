# Global Floating Chat Widget Implementation Summary

## Overview

This document describes the implementation of a Facebook-style global floating chat widget for the METU Help App. The chat overlay allows users to multitask by keeping chats accessible from anywhere in the app without navigating away from the current screen.

## Architecture

### 1. Context Layer (`src/contexts/ChatOverlayContext.tsx`)

**Purpose**: Global state management for the chat overlay

**Key Features**:
- Manages overlay visibility (open/closed, minimized/expanded)
- Tracks active view (thread list or conversation)
- Subscribes to user's chats in real-time using `subscribeToUserChats`
- Calculates unread message count across all chats
- Provides actions: `openChat`, `openChatByRequestId`, `closeChat`, `toggleMinimize`, `goBackToThreads`

**State Structure**:
```typescript
{
  isOpen: boolean;
  isMinimized: boolean;
  activeView: "threads" | "conversation";
  activeChatId: string | null;
  chats: Chat[];
  unreadCount: number;
}
```

### 2. Component Layer (`src/components/ChatOverlay.tsx`)

**Purpose**: UI implementation of the floating chat widget

**Components**:

#### MinimizedBubble
- Floating action button (FAB) in bottom-right corner
- Shows unread message count badge
- Animated press feedback
- Positioned: `bottom: 32px (web) / 96px (mobile), right: 32px`

#### ThreadListView
- Lists all active chat conversations
- Shows request title, other participant name, last message, and time
- Empty state with icon when no chats exist
- Click on thread to open conversation

#### ConversationView
- Displays messages for selected chat
- Shows chat header with request title and participant name
- Back button to return to thread list
- Message bubbles (own messages on right, others on left)
- Real-time message updates via `subscribeToMessages`
- Text input with send button
- Auto-scrolls to latest message

#### ExpandedWindow
- Container for ThreadListView and ConversationView
- Platform-specific rendering:
  - **Web**: Bottom-right positioned box (300x400px)
  - **Mobile**: Full-screen modal from bottom (90% width, 70% height)
- Header with title, minimize, and close buttons
- KeyboardAvoidingView for proper input handling

**Styling**:
- Uses theme system for colors and spacing
- Follows METU design guidelines (Maroon primary color)
- Consistent with existing component styles
- Animations using react-native-reanimated

### 3. Integration Layer

#### App.tsx
- Added `ChatOverlayProvider` to provider hierarchy (after AuthProvider)
- Mounted `ChatOverlay` component at root level
- Overlay renders above navigation using absolute positioning with z-index: 1000

#### NeedHelpScreen.tsx
- Integrated `useChatOverlay` hook
- "Open Chat" button now calls `openChat(chatId)` instead of navigating
- Maintains existing functionality for viewing request details

#### RequestDetailScreen.tsx
- Integrated `useChatOverlay` hook
- Added `handleOpenChat` function to open chat via overlay
- When user offers help, chat opens in overlay instead of navigating
- Fixed missing language and state variables

## User Flow

### Opening a Chat
1. User clicks "Open Chat" on a help request (NeedHelpScreen)
2. Context updates: `activeView = "conversation"`, `isMinimized = false`, `isOpen = true`
3. ChatOverlay renders ExpandedWindow with ConversationView
4. User can send/receive messages in real-time
5. User can click back to see all threads
6. User can minimize to floating bubble

### Navigating Between Views
1. **Thread List** → **Conversation**: Click on any thread item
2. **Conversation** → **Thread List**: Click back button in header
3. **Expanded** → **Minimized**: Click minimize button in header
4. **Minimized** → **Expanded**: Click floating bubble
5. **Close**: Click X button in header (resets to minimized state)

### Multitasking
1. User opens chat from NeedHelpScreen
2. User minimizes chat (bubble appears in bottom-right)
3. User navigates to ProfileScreen
4. Chat bubble remains visible
5. User can click bubble to continue conversation
6. Chat overlay persists across all screens

## Technical Details

### Real-time Updates
- **Chats**: `subscribeToUserChats` (from chatService) listens to Firestore
- **Messages**: `subscribeToMessages` (from chatService) listens to subcollection
- Updates trigger React state changes, causing re-renders

### Platform Differences

| Feature | Web | Mobile |
|---------|-----|--------|
| Container | Absolute positioned box | Full-screen Modal |
| Size | 300x400px | 90% width, 70% height |
| Position | Bottom-right corner | Bottom slide-up |
| Background | Floating with shadow | Semi-transparent overlay |

### Memory Management
- Unsubscribe functions called in cleanup
- Chat subscriptions reset when user logs out
- Component unmount handlers prevent memory leaks

### Security
- User authentication required (overlay hidden if not authenticated)
- Chat access validated by Firebase security rules
- Only participants can see their messages

## File Changes Summary

### New Files
1. `/src/contexts/ChatOverlayContext.tsx` - Context for global state (162 lines)
2. `/src/components/ChatOverlay.tsx` - Main overlay component (547 lines)

### Modified Files
1. `App.tsx` - Added provider and overlay mount (7 lines changed)
2. `screens/NeedHelpScreen.tsx` - Integrated overlay (10 lines changed)
3. `screens/RequestDetailScreen.tsx` - Integrated overlay, fixed issues (43 lines changed)

### Total Impact
- **Added**: 709 lines
- **Modified**: 60 lines
- **Files changed**: 5

## Testing Recommendations

### Manual Testing
1. **Authentication Flow**
   - [ ] Login with test account
   - [ ] Verify bubble appears after login
   - [ ] Verify bubble disappears after logout

2. **Chat Creation**
   - [ ] Create a help request
   - [ ] Have another user offer help
   - [ ] Verify chat appears in thread list

3. **Messaging**
   - [ ] Send message from requester
   - [ ] Verify helper receives message
   - [ ] Send message from helper
   - [ ] Verify requester receives message
   - [ ] Check real-time updates

4. **UI States**
   - [ ] Click bubble to expand
   - [ ] Verify thread list shows
   - [ ] Click thread to open conversation
   - [ ] Click back to return to thread list
   - [ ] Click minimize to collapse
   - [ ] Click close to hide overlay

5. **Navigation Persistence**
   - [ ] Open chat from NeedHelpScreen
   - [ ] Minimize chat
   - [ ] Navigate to ProfileScreen
   - [ ] Verify bubble still visible
   - [ ] Expand chat
   - [ ] Verify conversation maintained

6. **Platform-Specific**
   - [ ] Test on web browser
   - [ ] Test on iOS simulator
   - [ ] Test on Android emulator
   - [ ] Verify keyboard handling on all platforms

### Automated Testing (Future)
1. Unit tests for ChatOverlayContext actions
2. Component tests for ChatOverlay UI states
3. Integration tests for chat flow
4. E2E tests for complete user journey

## Known Limitations

1. **Unread Count**: Currently shows total number of chats, not actual unread messages. Future enhancement needed to track read/unread status.

2. **Push Notifications**: Not implemented. Users must open the app to see new messages.

3. **Message History**: Limited to in-memory messages during session. Full history loading not implemented.

4. **Typing Indicators**: Not implemented. Users cannot see when others are typing.

5. **File Attachments**: Not supported. Only text messages.

6. **Message Reactions**: Not implemented.

## Future Enhancements

1. **Unread Message Tracking**
   - Add `read: boolean` field to messages
   - Track last read timestamp per user
   - Update badge with actual unread count

2. **Rich Messages**
   - File attachments (images, documents)
   - Voice messages
   - Link previews

3. **Enhanced UX**
   - Typing indicators
   - Message reactions (emoji)
   - Message editing/deletion
   - Search within conversations

4. **Notifications**
   - Push notifications for new messages
   - In-app notification sounds
   - Desktop notifications (web)

5. **Performance**
   - Message pagination
   - Virtual scrolling for long conversations
   - Image lazy loading

6. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

## Conclusion

The global floating chat widget has been successfully implemented according to the requirements. It provides a seamless, Facebook-style chat experience that allows users to multitask while maintaining conversations. The implementation follows React Native and Expo best practices, integrates cleanly with existing code, and maintains the METU Help App design system.

The feature is ready for testing and can be further enhanced based on user feedback and requirements.
