#!/bin/bash
# ──────────────────────────────────────────────────────────────
#  HABIT GARDEN · Mac Setup Script
#  Run this once:  chmod +x setup.sh && ./setup.sh
# ──────────────────────────────────────────────────────────────

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "🌿  Habit Garden — Firebase Setup"
echo "──────────────────────────────────"
echo ""

# ── 1. Check / install Node ────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not found. Installing via Homebrew...${NC}"
  if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Installing Homebrew first...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install node
else
  echo -e "${GREEN}✓ Node $(node -v) found${NC}"
fi

# ── 2. Install Firebase CLI ────────────────────────────────────
if ! command -v firebase &> /dev/null; then
  echo -e "${YELLOW}Installing Firebase CLI...${NC}"
  npm install -g firebase-tools
else
  echo -e "${GREEN}✓ Firebase CLI $(firebase --version) found${NC}"
fi

# ── 3. Login ───────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 1/4 — Log in to Firebase (browser will open)${NC}"
firebase login

# ── 4. Collect project ID ─────────────────────────────────────
echo ""
echo -e "${YELLOW}Step 2/4 — Firebase Project Setup${NC}"
echo ""
echo "  If you haven't created a Firebase project yet:"
echo "  → Go to https://console.firebase.google.com"
echo "  → Click 'Add project', name it 'habit-garden'"
echo "  → Enable Google Analytics (optional)"
echo "  → In the project, enable:"
echo "      Authentication → Google sign-in"
echo "      Firestore → Create database (start in test mode)"
echo "      Storage → Get started"
echo "  → Project Settings → Add web app → copy the config object"
echo ""
read -p "  Enter your Firebase Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}No project ID entered. Exiting.${NC}"
  exit 1
fi

# ── 5. Write .firebaserc ──────────────────────────────────────
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF
echo -e "${GREEN}✓ .firebaserc written${NC}"

# ── 6. Paste Firebase config ──────────────────────────────────
echo ""
echo -e "${YELLOW}Step 3/4 — Paste your Firebase web config${NC}"
echo ""
echo "  From Firebase Console → Project Settings → Your apps → Web app"
echo "  Copy the values and paste them below."
echo ""
read -p "  apiKey:            " API_KEY
read -p "  authDomain:        " AUTH_DOMAIN
read -p "  projectId:         " PROJECT_ID2
read -p "  storageBucket:     " STORAGE_BUCKET
read -p "  messagingSenderId: " MESSAGING_ID
read -p "  appId:             " APP_ID

# Patch js/firebase.js with real values
sed -i '' \
  -e "s|PASTE_YOUR_API_KEY|$API_KEY|g" \
  -e "s|PASTE_YOUR_AUTH_DOMAIN|$AUTH_DOMAIN|g" \
  -e "s|PASTE_YOUR_PROJECT_ID|$PROJECT_ID2|g" \
  -e "s|PASTE_YOUR_STORAGE_BUCKET|$STORAGE_BUCKET|g" \
  -e "s|PASTE_YOUR_MESSAGING_SENDER_ID|$MESSAGING_ID|g" \
  -e "s|PASTE_YOUR_APP_ID|$APP_ID|g" \
  js/firebase.js

echo -e "${GREEN}✓ Firebase config injected into js/firebase.js${NC}"

# ── 7. Add authorized domain for Google Auth ──────────────────
echo ""
echo -e "${YELLOW}Almost there! One manual step:${NC}"
echo ""
echo "  In Firebase Console → Authentication → Settings → Authorized domains"
echo "  Your hosting URL will be: https://$PROJECT_ID.web.app"
echo "  It's added automatically on first deploy, but if Google sign-in fails,"
echo "  add your domain manually there."
echo ""

# ── 8. Deploy ─────────────────────────────────────────────────
echo -e "${YELLOW}Step 4/4 — Deploying to Firebase Hosting...${NC}"
echo ""
firebase deploy --only hosting,firestore:rules,storage

echo ""
echo -e "${GREEN}────────────────────────────────────────────${NC}"
echo -e "${GREEN}  ✅  Habit Garden is live!${NC}"
echo ""
echo -e "  Your URL:  ${GREEN}https://$PROJECT_ID.web.app${NC}"
echo ""
echo "  To open on your phone:"
echo "  1. Open the URL above in Chrome (Android) or Safari (iOS)"
echo "  2. Android: Menu → 'Add to Home screen'"
echo "     iOS:     Share → 'Add to Home Screen'"
echo ""
echo "  To redeploy after changes:"
echo "  firebase deploy --only hosting"
echo ""
echo -e "${GREEN}────────────────────────────────────────────${NC}"
