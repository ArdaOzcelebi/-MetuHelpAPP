Firebase Authentication Setup (Vercel + local)

What this repo does in demo mode
- If Firebase env vars are not set, the app loads in demo mode (authentication disabled).
- The app logs a clear console warning with the missing env var names.
- The UI shows a banner telling that authentication is disabled.

Required environment variables (names to add in Vercel)
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- (optional) NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

Steps to enable authentication

1) Create a Firebase project & register a Web App
- Visit https://console.firebase.google.com/
- Create/select project.
- Click the web icon (</>) to register a web app and copy the config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

2) Add env vars to Vercel
- Vercel → Project → Settings → Environment Variables
- Add the NEXT_PUBLIC_* variables with values copied from Firebase.
- Save and redeploy (env vars are injected at build time).

3) Optional: local .env.local
- Create .env.local in project root (do NOT commit).
- Add the same keys (NEXT_PUBLIC_FIREBASE_*). Restart dev server after saving.

4) Enable Email/Password sign-in
- Firebase Console → Authentication → Sign-in method → Enable "Email/Password".

5) Authorized domains
- Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain (your-project.vercel.app) and localhost if needed.

6) Test
- Redeploy on Vercel & register a user using @metu.edu.tr email, verify email, login flow.

Security note
- Firebase web config is safe to expose on client builds. Do not commit service account JSON or server-only secrets.
