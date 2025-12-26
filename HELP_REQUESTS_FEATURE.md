# Help Requests Feature - Implementation Guide

## Overview

This document describes the Help Requests feature implementation for the METU Help app, which enables students to post help requests and view/respond to requests from other students in real-time using Firebase Firestore.

## Architecture

### Components

1. **NeedHelpScreen** - Displays all active help requests with real-time updates
2. **PostNeedScreen** - Form to create new help requests
3. **RequestDetailScreen** - Shows detailed information about a specific request

### Data Layer

- **Firebase Firestore** - Cloud database for storing help requests
- **Service Layer** (`helpRequestService.ts`) - Abstraction for Firestore operations
- **Type Definitions** (`helpRequest.ts`) - TypeScript interfaces

## Features

### Help Requests Listing (NeedHelpScreen)

- ✅ Real-time updates using Firebase `onSnapshot()`
- ✅ Category filtering (All, Medical, Academic, Transport, Other)
- ✅ Displays: item name, category, location, time posted, urgent badge
- ✅ Floating action button to create new requests
- ✅ Loading and empty states
- ✅ Smooth animations and transitions

### Help Request Form (PostNeedScreen)

Required fields:
- ✅ **Item Name** - Text input (60 character limit)
- ✅ **Category** - Selection from: Medical, Academic, Transport, Other
- ✅ **Location** - Selection from predefined campus locations:
  - Library, Student Center, Engineering Building, Physics Building
  - Main Gate, Cafeteria, Dormitory Area, Sports Complex, Other
- ✅ **Description** - Optional textarea for additional details
- ✅ **Is Return Needed** - Toggle button
- ✅ **Mark as Urgent** - Toggle button

Validation:
- All required fields must be filled
- User must be authenticated
- Shows character count for item name
- Disabled submit button when invalid

### Request Details (RequestDetailScreen)

- ✅ Fetches request from Firestore by ID
- ✅ Displays full request information
- ✅ Shows poster name and avatar
- ✅ Time posted (relative: "5 min ago", "2 hr ago")
- ✅ Category badge with icon
- ✅ Location information
- ✅ "I Can Help" button
- ✅ Loading and error states

## Database Schema

### Firestore Collection: `helpRequests`

```typescript
interface HelpRequest {
  id: string;                    // Auto-generated document ID
  title: string;                 // Item name
  category: HelpRequestCategory; // "medical" | "academic" | "transport" | "other"
  description: string;           // Additional details
  location: string;              // Campus location
  isReturnNeeded: boolean;       // Whether item needs to be returned
  urgent: boolean;               // Urgent flag
  userId: string;                // Creator's user ID
  userEmail: string;             // Creator's email
  userName: string;              // Creator's display name
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  status: string;                // "active" | "fulfilled" | "cancelled"
}
```

## Service Functions

### `createHelpRequest()`
```typescript
async function createHelpRequest(
  requestData: CreateHelpRequestData,
  userId: string,
  userEmail: string,
  userName: string
): Promise<string>
```
Creates a new help request in Firestore.

### `subscribeToHelpRequests()`
```typescript
function subscribeToHelpRequests(
  callback: (requests: HelpRequest[]) => void,
  category?: HelpRequestCategory
): Unsubscribe
```
Sets up a real-time listener for help requests. Optionally filters by category.

### `getHelpRequest()`
```typescript
async function getHelpRequest(requestId: string): Promise<HelpRequest | null>
```
Fetches a single help request by ID.

### `updateHelpRequestStatus()`
```typescript
async function updateHelpRequestStatus(
  requestId: string,
  status: "active" | "fulfilled" | "cancelled"
): Promise<void>
```
Updates the status of a help request.

### `deleteHelpRequest()`
```typescript
async function deleteHelpRequest(requestId: string): Promise<void>
```
Deletes a help request from Firestore.

## Navigation Flow

```
Home Screen
    ↓ (tap "NEED HELP")
NeedHelp Screen (List of Requests)
    ↓ (tap FAB button)
PostNeed Screen (Form) ← Modal
    ↓ (submit form)
← Back to NeedHelp Screen

NeedHelp Screen
    ↓ (tap request card)
RequestDetail Screen
    ↓ (tap "I Can Help")
Alert shown
```

## Multi-language Support

All UI text supports English and Turkish:

English:
- "What do you need?"
- "Category"
- "Location"
- "Mark as Urgent"
- "Post Request"

Turkish:
- "Neye ihtiyacınız var?"
- "Kategori"
- "Konum"
- "Acil olarak işaretle"
- "İsteği Gönder"

## Security Rules

**Important**: Configure Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /helpRequests/{requestId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      
      // Only authenticated users can create
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.userId;
      
      // Only the creator can update/delete
      allow update, delete: if request.auth != null 
                            && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Testing Checklist

- [ ] Create a new help request
- [ ] Verify it appears in the list immediately
- [ ] Test category filtering
- [ ] View request details
- [ ] Switch between English and Turkish
- [ ] Test urgent toggle
- [ ] Test return needed toggle
- [ ] Test form validation (empty fields)
- [ ] Test with/without authentication
- [ ] Test on multiple devices for real-time sync

## Error Handling

The implementation handles:
- ✅ Authentication errors (user not logged in)
- ✅ Network errors (Firestore connection issues)
- ✅ Missing data (request not found)
- ✅ Invalid input (form validation)

All errors show user-friendly alert messages.

## Performance Considerations

- Real-time listeners are cleaned up when components unmount
- Queries are indexed by status and createdAt
- Timestamps are properly converted from Firestore format
- Loading states prevent multiple simultaneous submissions

## Future Enhancements

Possible improvements:
- Push notifications when someone offers to help
- Direct messaging between users
- Image attachments for requests
- Request expiration time
- Rating system for helpers
- Search functionality
- Map view for locations
