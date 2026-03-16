# 🌿 Habit Garden — PWA Setup Guide

## What you'll have in 15 minutes
A live PWA at `https://YOUR-PROJECT.web.app` you can open on your phone,
install to the home screen, and test with real Google sign-in.

---

## Step 1 — Firebase Console (browser, 5 min)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `habit-garden` → Continue
3. Disable Google Analytics for now (faster) → **Create project**

Once inside the project:

### Enable Authentication
- Left sidebar → **Authentication** → **Get started**
- **Sign-in method** tab → Enable **Google** → Save

### Create Firestore Database
- Left sidebar → **Firestore Database** → **Create database**
- Choose **Start in test mode** (you'll tighten rules later)
- Pick a region close to India: `asia-south1` (Mumbai)

### Enable Storage
- Left sidebar → **Storage** → **Get started** → Next → Done

### Get your web config
- Click the gear icon (⚙️) → **Project settings**
- Scroll down to **"Your apps"** → click **`</>`** (web)
- App nickname: `habit-garden-pwa` → **Register app**
- Copy the `firebaseConfig` object — you'll need it in Step 3

---

## Step 2 — Run the setup script (Terminal, 2 min)

```bash
# Unzip the download, then cd into it
unzip habit-garden-pwa.zip
cd habit-garden-pwa

# Make the script executable and run it
chmod +x setup.sh
./setup.sh
```

The script will:
- Install Node.js + Firebase CLI if not present (via Homebrew)
- Open a browser for Firebase login
- Ask for your Project ID and Firebase config values
- Inject the config into the app automatically
- Deploy everything to Firebase Hosting

---

## Step 3 — Open on your phone

After the script finishes it prints your URL:
```
https://habit-garden-XXXXX.web.app
```

**Android:**
1. Open the URL in **Chrome**
2. Tap the **three-dot menu** → **"Add to Home screen"**
3. Tap **Add** — it installs like a native app

**iOS (iPhone/iPad):**
1. Open the URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share button** (square with arrow)
3. Scroll down → **"Add to Home Screen"** → **Add**

---

## After installing — what works

| Feature | Status |
|---------|--------|
| Google sign-in | ✅ Real Firebase Auth |
| Home garden with plants | ✅ |
| Today's habits + completion flow | ✅ Mock data (localStorage) |
| Add habit (4-step flow) | ✅ |
| Feed, Notifications, Messages | ✅ Mock data |
| Profile screen | ✅ |
| Offline support | ✅ Service worker cached |
| Photo/video capture | ⚠️ UI ready, needs camera API wiring |
| Real Firestore persistence | ⚠️ Firebase module wired, needs full integration |
| Push notifications | ⚠️ Next iteration |

---

## Redeploying after changes

```bash
# From the habit-garden-pwa folder
firebase deploy --only hosting
```

---

## Tightening Firestore rules (before sharing with others)

```bash
firebase deploy --only firestore:rules,storage
```

The `firestore.rules` and `storage.rules` files in this folder are
production-ready rules that only let users read/write their own data.

---

## File structure

```
habit-garden-pwa/
├── index.html          ← App shell + Firebase init + auth
├── manifest.json       ← PWA manifest
├── sw.js               ← Service worker (offline cache)
├── firebase.json       ← Firebase hosting + rules config
├── firestore.rules     ← Firestore security rules
├── storage.rules       ← Storage security rules
├── setup.sh            ← One-command Mac setup
├── css/
│   └── app.css         ← All styles
├── js/
│   ├── data.js         ← Mock data + localStorage state
│   ├── firebase.js     ← Full Firebase helper (reference)
│   ├── auth.js         ← Auth screen module (reference)
│   ├── app.js          ← Nav controller + init
│   └── screens/
│       ├── home.js
│       ├── feed.js
│       ├── notifs-msgs-profile.js
│       └── overlays.js  ← Add habit, complete, plant detail
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## Next steps after testing

Once you've validated the flows on your phone, the next build will wire:
1. Real habit creation → Firestore `habits` collection
2. Completion logging with camera → Firestore + Storage
3. Real feed from Firestore with live updates
4. Push notifications via Firebase Cloud Messaging
5. Leaderboard Cloud Function that updates on each completion
