# Troubleshooting Help Requests Not Appearing

## Issue
Help requests are successfully submitted but don't appear in the Find Help screen.

## Diagnostic Steps

### 1. Check Console Logs
Open the browser/app console and look for these log messages in sequence:

#### When Submitting a Request (PostNeedScreen):
```
[createHelpRequest] Starting with input: {...}
[createHelpRequest] Data to be written: {...}
[createHelpRequest] Successfully created with ID: [document-id]
[createHelpRequest] Collection: helpRequests
```

**What to check:**
- Verify all required fields are present (title, category, location, userId)
- Note the document ID that was created
- Check for any error messages

#### When Loading Find Help Screen (NeedHelpScreen):
```
[NeedHelpScreen] Setting up subscription for category: all
[subscribeToHelpRequests] Setting up subscription, category: all
[subscribeToHelpRequests] Snapshot received, document count: X
[subscribeToHelpRequests] Processing document: [document-id] {...}
[subscribeToHelpRequests] Processed requests: X
[NeedHelpScreen] Received requests update, count: X
[NeedHelpScreen] Received requests: [...]
[NeedHelpScreen] Render - helpRequests count: X
[NeedHelpScreen] Render - filteredRequests count: X
```

**What to check:**
- Does the snapshot count match expected number of documents?
- Are documents being processed successfully?
- Do the document IDs include the one you just created?
- Are requests making it to the component state?

### 2. Common Issues and Solutions

#### Issue: Snapshot count is 0
**Possible causes:**
1. **Firestore Security Rules** - The user doesn't have read permissions
   - Check Firebase Console → Firestore → Rules
   - Ensure rules allow authenticated users to read
   
2. **Wrong collection name** - Data is being written to wrong collection
   - Verify collection name is "helpRequests"
   - Check Firebase Console → Firestore → Data
   
3. **Network/Connectivity** - Firestore is offline
   - Check network connection
   - Look for error messages in console

**Solution:**
```javascript
// Required Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /helpRequests/{request} {
      // Allow authenticated users to read all active requests
      allow read: if request.auth != null;
      
      // Allow authenticated users to create their own requests
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      
      // Allow users to update/delete only their own requests
      allow update, delete: if request.auth != null
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Issue: Documents are processed but requests array is empty
**Possible causes:**
1. **Field validation failing** - Documents don't have required fields
   - Look for warning: `[subscribeToHelpRequests] Failed to convert document`
   - Check that documents have: title, category, location, userId

2. **Status filter** - Documents have status other than "active"
   - Query filters for `status == "active"`
   - Check document status field

**Solution:**
- Ensure all required fields are set when creating
- Verify status is set to "active"

#### Issue: Requests reach component but don't display
**Possible causes:**
1. **React rendering issue** - State not triggering re-render
2. **Category filter mismatch** - Client-side filter removing items

**Debug:**
- Check render logs show correct counts
- Verify selectedCategory matches request categories
- Try selecting "All" category

#### Issue: Request appears briefly then disappears
**Possible causes:**
1. **Subscription re-firing** - useEffect dependency causing re-subscription
2. **Component unmounting** - Navigation issue

**Solution:**
- Check cleanup logs: `[NeedHelpScreen] Cleaning up subscription`
- Ensure useEffect dependency array is correct `[selectedCategory]`

### 3. Firestore Composite Index Required

If you see this error in console:
```
The query requires an index
```

**Solution:**
1. Click the link in the error message (auto-generates index)
2. Or manually create in Firebase Console:
   - Collection: `helpRequests`
   - Fields indexed:
     - status (Ascending)
     - category (Ascending)  
     - createdAt (Descending)

### 4. Testing Checklist

- [ ] Firebase credentials configured in `.env.local`
- [ ] User is authenticated (logged in)
- [ ] Firestore security rules allow read/write
- [ ] Network connection is stable
- [ ] Console shows no error messages
- [ ] Console shows successful document creation
- [ ] Console shows snapshot with correct count
- [ ] Category filter is set to "All" or matches created request
- [ ] Browser/app has been refreshed after changes

### 5. Manual Verification

#### Verify data in Firebase Console:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `helpRequests` collection
4. Look for your document with the logged ID
5. Verify fields:
   - title: (string)
   - category: (medical/academic/transport/other)
   - location: (string)
   - userId: (string)
   - status: "active"
   - createdAt: (timestamp)
   - updatedAt: (timestamp)

#### Verify authentication:
1. Check Firebase Console → Authentication
2. Confirm user is logged in
3. Note the user UID
4. Verify it matches the userId in the document

### 6. Quick Fixes

#### Force Refresh:
1. Close the app/browser completely
2. Clear browser cache (or app cache)
3. Restart and login again
4. Try creating a new request

#### Reset State:
1. Log out
2. Log back in
3. Navigate to Find Help screen
4. Check if existing requests appear
5. Create a new request

### 7. Contact Support

If issue persists after trying all above steps, provide:
- Complete console logs from submission
- Complete console logs from viewing Find Help screen
- Screenshot of Firebase Firestore data
- Screenshot of Firebase Security Rules
- User authentication status
- Network status
