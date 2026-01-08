# Firestore Index Requirements for Statistics

## Overview
The real-time statistics feature requires **composite indexes** in Firestore for queries that filter on multiple fields. Without these indexes, the affected statistics will show `0` instead of failing the entire app.

## Required Indexes

### 1. "Helped Today" Query
**Collection:** `helpRequests`  
**Fields:**
- `status` (Ascending)
- `updatedAt` (Ascending)

**Query Filters:**
- `where('status', '==', 'fulfilled')`
- `where('updatedAt', '>=', startOfToday)`

**Error Message:**
```
FirebaseError: The query requires an index.
```

**To Create:**
Click the link in the error message, or manually create in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (metuhelpapp)
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Collection ID: `helpRequests`
6. Add fields:
   - Field: `status`, Type: Ascending
   - Field: `updatedAt`, Type: Ascending
7. Click "Create"

### 2. "Help Given" Query
**Collection:** `helpRequests`  
**Fields:**
- `acceptedBy` (Ascending)
- `status` (Ascending)

**Query Filters:**
- `where('acceptedBy', '==', user.uid)`
- `where('status', '==', 'fulfilled')`

**To Create:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (metuhelpapp)
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Collection ID: `helpRequests`
6. Add fields:
   - Field: `acceptedBy`, Type: Ascending
   - Field: `status`, Type: Ascending
7. Click "Create"

## Queries That Work Without Indexes

The following statistics work without composite indexes:

1. **Active Requests** - Single field filter on `status`
2. **Requests Posted** - Single field filter on `userId`

## Graceful Degradation

The `useCampusStats` hook implements graceful error handling:
- If an index is missing, the affected statistic shows `0`
- A warning is logged to the console with instructions
- Other statistics continue to work normally
- The app does not crash or show error messages to users

## Index Creation Status

Track the status of your indexes here:

- [ ] **Helped Today Index** (`status` + `updatedAt`)
- [ ] **Help Given Index** (`acceptedBy` + `status`)

## Quick Links

- [Create Helped Today Index](https://console.firebase.google.com/v1/r/project/metuhelpapp/firestore/indexes?create_composite=ClBwcm9qZWN0cy9tZXR1aGVscGFwcC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvaGVscFJlcXVlc3RzL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg0KCXVwZGF0ZWRBdBABGgwKCF9fbmFtZV9fEAE)
- [Firebase Console - Indexes](https://console.firebase.google.com/project/metuhelpapp/firestore/indexes)

## Testing After Index Creation

After creating the indexes:

1. Wait 2-5 minutes for indexes to build (status changes from "Building" to "Enabled")
2. Refresh the app (Ctrl+R or Cmd+R)
3. Navigate to Home Screen or Profile Screen
4. Verify statistics show correct numbers instead of 0
5. Check browser console - warnings should disappear

## Alternative: Remove Time-Based Filter

If you cannot create indexes immediately, you can temporarily modify the query to show all fulfilled requests (not just today):

```typescript
// Instead of:
where("updatedAt", ">=", startOfTodayTimestamp)

// Use a single-field query:
where("status", "==", "fulfilled")
```

**Note:** This is not recommended for production as it changes the statistic's meaning from "helped today" to "all fulfilled requests".

## Cost Considerations

**Firestore Pricing:**
- Index storage: Included in standard database storage pricing
- Queries using indexes: Same cost as queries without indexes
- Using `getCountFromServer()`: Very efficient, only counts documents without downloading them

**Benefit:**
Creating these indexes does not increase query costs and is essential for the feature to work correctly.
