# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select "Study Craft AI" if already created
3. Follow the setup wizard (you can disable Google Analytics for now)

## Step 2: Add Web App

1. In your Firebase project, click the Settings gear icon ⚙️ (next to "Project Overview")
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **`</>`** icon (web platform)
5. Register app:
   - App nickname: `Study Craft AI Web`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**

## Step 3: Copy Configuration

You'll see code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "study-craft-ai.firebaseapp.com",
  projectId: "study-craft-ai",
  storageBucket: "study-craft-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

📋 **Copy this entire object** - you'll paste it in the next step!

## Step 4: Enable Google Authentication

1. In the Firebase Console left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Find **"Google"** in the providers list
5. Click **"Google"**
6. Toggle the **"Enable"** switch
7. Select your support email from dropdown
8. Click **"Save"**

## Step 5: Paste Your Config

Open the file: `src/services/firebaseConfig.js`

Replace the placeholder values with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // ← Paste here
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 6: Test!

Run the app:
```bash
npm run dev
```

You should see:
- ✅ Premium login page
- ✅ "Continue with Google" button
- ✅ After login: main app with your profile
- ✅ Sign out button works

---

## Troubleshooting

**Error: "Firebase: Error (auth/configuration-not-found)"**
→ You forgot to paste your actual Firebase config

**Error: "Firebase: Error (auth/unauthorized-domain)"**
→ Add `localhost` to authorized domains in Firebase Console:
   - Authentication → Settings → Authorized domains → Add domain

**Login popup doesn't appear**
→ Check browser popup blocker settings

---

## That's it! 🎉
Once configured, your app will have:
- Google Sign-In
- User profiles
- Protected routes
- Ready for cloud data storage (future)
