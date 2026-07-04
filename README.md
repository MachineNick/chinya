# WinzoIndia

A gaming platform with Ludo, Snake & Ladder, and tournament support.

## Running the Project

### Frontend (Static)
```bash
cd frontend
npm install --legacy-peer-deps
npm start
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
# Create .env file (see below)
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# → http://localhost:8001
```

### MongoDB
```bash
brew services start mongodb/brew/mongodb-community
```

---

## Pages

| Page | URL |
|---|---|
| Home | http://localhost:3000/index.html |
| Login | http://localhost:3000/login.html |
| Signup | http://localhost:3000/signup.html |
| Dashboard | http://localhost:3000/dashboard.html |
| Profile | http://localhost:3000/profile.html |
| Ludo | http://localhost:3000/ludo.html |
| Snake & Ladder | http://localhost:3000/snake-ladder.html |
| Admin (basic) | http://localhost:3000/admin.html |
| **Admin Dashboard** | **http://localhost:3000/admin2.html** |

**Admin passcode:** `winzo-admin-2026`

---

## Admin Dashboard (admin2.html)

Full admin console with:
- **Setup** — Deposit reports, tournaments, challenges, blacklisted names
- **Game Management** — View/add regular & tournament games
- **User Management** — View all, add, KYC review, fraud, wallet mismatch
- **Challenge Management** — 24h, running, search, screenshots, all challenges
- **Transaction Management** — Deposits, withdrawals, manual deposit/withdraw

> All data is currently **static (localStorage)**. Firebase integration is pending.

---

## Environment Variables

### backend/.env
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=chinya
CORS_ORIGINS=http://localhost:3000
```

### Firebase (frontend/public/js/firebase-config.js)
Replace placeholder values with your Firebase project credentials:
```js
// TODO: Add real Firebase credentials
FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
FIREBASE_APP_ID=YOUR_APP_ID
```

Once Firebase is configured:
- User auth will use Firebase Auth instead of localStorage
- KYC documents will upload to Firebase Storage
- All admin panel data (users, challenges, transactions) will read from Firestore
- Replace `STATIC.*` arrays in `js/admin2-data.js` with Firestore queries
