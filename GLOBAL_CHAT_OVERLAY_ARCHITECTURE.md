# Global Chat Overlay - Visual Architecture

## Before Implementation

```
App.tsx
├── ErrorBoundary
│   └── LanguageProvider
│       └── AuthProvider
│           └── SafeAreaProvider
│               └── GestureHandlerRootView
│                   └── KeyboardProvider
│                       └── NavigationContainer
│                           └── MainTabNavigator (if authenticated)
│                               ├── HomeStack
│                               │   ├── HomeScreen
│                               │   ├── NeedHelpScreen
│                               │   └── ChatScreen ❌ (separate screen)
│                               ├── BrowseStack
│                               └── ProfileStack
```

**Problem**: Users had to navigate to a separate ChatScreen, losing context of their current task.

---

## After Implementation

```
App.tsx
├── ErrorBoundary
│   └── LanguageProvider
│       └── AuthProvider
│           └── ChatOverlayProvider ✨ (NEW)
│               └── SafeAreaProvider
│                   └── GestureHandlerRootView
│                       └── KeyboardProvider
│                           ├── NavigationContainer
│                           │   └── MainTabNavigator (if authenticated)
│                           │       ├── HomeStack
│                           │       │   ├── HomeScreen
│                           │       │   ├── NeedHelpScreen (uses openChat)
│                           │       │   └── RequestDetailScreen (uses openChat)
│                           │       ├── BrowseStack
│                           │       └── ProfileStack
│                           │
│                           └── ChatOverlay ✨ (NEW - Global overlay)
│                               ├── MinimizedBubble (FAB)
│                               └── ExpandedWindow
│                                   ├── ThreadListView
│                                   └── ConversationView
```

**Solution**: Chat overlay floats above all screens, accessible from anywhere.

---

## Component Hierarchy

```
<ChatOverlay>
│
├─── <MinimizedBubble>                    // FAB with unread badge
│    ├── Feather icon (message-circle)
│    └── Badge (unread count)
│
└─── <ExpandedWindow>                     // Main chat container
     │
     ├─── Header
     │    ├── Title ("Active Chats" or "Chat")
     │    ├── Minimize button
     │    └── Close button
     │
     └─── Content (conditional)
          │
          ├─── <ThreadListView>            // All conversations
          │    │
          │    ├── Empty State (if no chats)
          │    │
          │    └── FlatList
          │         └── <ThreadItem> (for each chat)
          │              ├── User icon
          │              ├── Request title
          │              ├── Participant name
          │              ├── Last message preview
          │              └── Time ago
          │
          └─── <ConversationView>          // Individual chat
               │
               ├── Header
               │    ├── Back button
               │    ├── Request title
               │    └── Participant name
               │
               ├── FlatList (Messages)
               │    └── <MessageBubble> (for each message)
               │         ├── Sender name (if not own)
               │         ├── Message text
               │         └── Timestamp
               │
               └── Input Area
                    ├── TextInput (multiline)
                    └── Send button
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatOverlayContext                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  State:                                              │   │
│  │  • isOpen: boolean                                   │   │
│  │  • isMinimized: boolean                              │   │
│  │  • activeView: "threads" | "conversation"           │   │
│  │  • activeChatId: string | null                      │   │
│  │  • chats: Chat[]                                    │   │
│  │  • unreadCount: number                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Actions:                                            │   │
│  │  • openChat(chatId)                                  │   │
│  │  • openChatByRequestId(requestId)                    │   │
│  │  • closeChat()                                       │   │
│  │  • toggleMinimize()                                  │   │
│  │  • goBackToThreads()                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ subscribeToUserChats(userId)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Firestore                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Collection: "chats"                                 │   │
│  │  Query: where("requesterId" == userId)              │   │
│  │      OR where("helperId" == userId)                  │   │
│  │                                                       │   │
│  │  Real-time updates via onSnapshot                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Interaction Flow

### Scenario 1: Opening Chat from NeedHelpScreen

```
User on NeedHelpScreen
        │
        │ (clicks "Open Chat" button)
        ↓
  openChat(chatId) called
        │
        ↓
  Context updates:
  • isMinimized = false
  • isOpen = true
  • activeView = "conversation"
  • activeChatId = chatId
        │
        ↓
  ChatOverlay renders
  ExpandedWindow with
  ConversationView
        │
        ↓
  User sends/receives
  messages in real-time
```

### Scenario 2: Minimizing and Navigating

```
Chat is open
        │
        │ (user clicks minimize)
        ↓
  toggleMinimize() called
        │
        ↓
  Context updates:
  • isMinimized = true
        │
        ↓
  MinimizedBubble appears
  (bottom-right FAB)
        │
        │ (user navigates to ProfileScreen)
        ↓
  Bubble persists on
  ProfileScreen
        │
        │ (user clicks bubble)
        ↓
  toggleMinimize() called
        │
        ↓
  Chat expands again
  with same conversation
```

### Scenario 3: Browsing All Chats

```
Bubble is visible
        │
        │ (user clicks bubble)
        ↓
  toggleMinimize() called
        │
        ↓
  Context updates:
  • isMinimized = false
  • activeView = "threads"
        │
        ↓
  ThreadListView shows
  all active chats
        │
        │ (user clicks a thread)
        ↓
  openChat(chatId) called
        │
        ↓
  ConversationView opens
        │
        │ (user clicks back)
        ↓
  goBackToThreads() called
        │
        ↓
  ThreadListView appears
```

---

## Platform-Specific Rendering

### Web (Desktop/Laptop)
```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Window                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                     │     │
│  │              Main Content Area                      │     │
│  │                                                     │     │
│  │                                                     │     │
│  │                                                     │     │
│  │                                                     │     │
│  │                                                     │     │
│  │                                          ┌─────────┐│     │
│  │                                          │         ││     │
│  │                                          │  Chat   ││     │
│  │                                          │ Window  ││     │
│  │                                          │ 300x400 ││     │
│  │                                          │   px    ││     │
│  │                                          │         ││     │
│  │                                          └─────────┘│     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (iOS/Android)
```
┌───────────────────────────────────┐
│       Phone Screen                │
│                                   │
│  ┌─────────────────────────────┐  │
│  │                             │  │
│  │    Main Content Area        │  │
│  │                             │  │
│  │                             │  │
│  │                             │  │
│  │                             │  │
│  │                          (○)│  │ ← FAB (minimized)
│  └─────────────────────────────┘  │
│                                   │
│  When expanded:                   │
│  ┌─────────────────────────────┐  │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │ ← Semi-transparent
│  │█████████████████████████████│  │    overlay
│  │█                           █│  │
│  │█     Chat Modal            █│  │
│  │█     (Bottom Sheet)        █│  │
│  │█     90% width             █│  │
│  │█     70% height            █│  │
│  │█                           █│  │
│  │█████████████████████████████│  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## Data Flow

```
┌──────────────────┐
│  User Action     │
│  (e.g., send msg)│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Component       │
│  (ConversationView)
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Service Layer   │
│  (sendMessage)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Firebase        │
│  Firestore       │
│  Write Operation │
└────────┬─────────┘
         │
         │ (Real-time listener)
         ↓
┌──────────────────┐
│  onSnapshot      │
│  Callback        │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Context Update  │
│  (setMessages)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  React Re-render │
│  (Message appears)
└──────────────────┘
```

---

## Key Design Decisions

### 1. Context vs Redux
**Decision**: Use React Context API
**Reason**: 
- Simpler setup for this use case
- Already using Context for Auth and Language
- No need for complex state management
- Fewer dependencies

### 2. Absolute Positioning vs Portal
**Decision**: Use absolute positioning with z-index
**Reason**:
- Works consistently across web and mobile
- Simpler implementation
- No need for additional portal libraries
- Proper stacking context control

### 3. Modal vs Custom Bottom Sheet
**Decision**: Use React Native Modal for mobile
**Reason**:
- Native component with proper gestures
- Handles keyboard automatically
- Better accessibility
- Platform-optimized

### 4. Single Chat vs Multi-Chat Context
**Decision**: Support multiple chats in context
**Reason**:
- Future-proof for group chats
- Allows thread list view
- Better UX (see all conversations)
- Aligns with Facebook Messenger pattern

### 5. Real-time vs Polling
**Decision**: Use Firestore onSnapshot (real-time)
**Reason**:
- Instant message delivery
- No polling overhead
- Built-in reconnection logic
- Better user experience

---

## Performance Considerations

### Memory Management
- Unsubscribe from Firestore listeners on unmount
- Clear chat state on logout
- Limit message history in memory

### Render Optimization
- Use FlatList for virtualized message rendering
- React.memo for message bubbles
- Prevent unnecessary re-renders with useCallback

### Network Efficiency
- Firestore uses WebSocket for real-time updates
- Only fetches changed documents
- Automatic local caching

---

## Accessibility Features

✅ **Keyboard Navigation**
- Tab through interactive elements
- Enter to send messages
- Escape to close overlay

✅ **Screen Readers**
- Proper ARIA labels
- Semantic HTML structure (web)
- Accessibility hints (mobile)

✅ **Visual Feedback**
- Clear focus states
- Animated transitions
- Loading indicators

✅ **Touch Targets**
- Minimum 44x44pt buttons
- Adequate spacing
- Easy-to-tap controls

---

## Security Model

```
Firebase Security Rules (Firestore)
│
├── Collection: "chats"
│   └── Rule: Read/Write if user is in members array
│
└── SubCollection: "chats/{chatId}/messages"
    └── Rule: Read if parent chat accessible
            Write if authenticated user in chat
```

**Key Points**:
- User authentication required
- Member-only access to chats
- Server-side validation
- No client-side security bypass possible

---

## Testing Strategy

### Unit Tests (Future)
```
ChatOverlayContext.test.tsx
├── openChat() updates state correctly
├── closeChat() resets state
├── toggleMinimize() toggles flag
└── goBackToThreads() changes view

ChatOverlay.test.tsx
├── MinimizedBubble renders with badge
├── ThreadListView shows chats
├── ConversationView sends messages
└── Platform-specific rendering works
```

### Integration Tests (Future)
```
ChatFlow.test.tsx
├── User can open chat from NeedHelpScreen
├── Messages appear in real-time
├── User can navigate between threads
└── Chat persists across navigation
```

### E2E Tests (Future)
```
e2e/chat-overlay.spec.ts
├── Complete chat flow from request to message
├── Multi-device message synchronization
├── Offline/online state handling
└── Platform-specific behaviors
```

---

## Metrics & Monitoring

Recommended metrics to track:
- Chat overlay open rate
- Average messages per session
- Message delivery latency
- Unread message count accuracy
- User engagement time in chat
- Platform usage (web vs mobile)

---

## Conclusion

The global floating chat widget transforms the METU Help App chat experience from a traditional navigation-based approach to a modern, multitasking-friendly overlay system. This implementation follows industry best practices (Facebook Messenger, WhatsApp Web) while maintaining consistency with the existing METU Help App architecture and design system.
