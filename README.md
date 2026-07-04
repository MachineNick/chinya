# WinzoIndia — Static Gaming Platform

Pure **HTML / CSS / Vanilla JS** with Firebase Web SDK (plug-in later). All backend-like state is stored in the browser's `localStorage` until real Firebase credentials are supplied.

## Pages

| URL | Purpose |
|---|---|
| `/index.html` | Landing (hero, features, game preview) |
| `/signup.html` | Fullname + Phone + Email + KYC upload |
| `/login.html` | Email/phone + password |
| `/dashboard.html` | User dashboard: chips, bonus contact, disclaimer, Set-a-Game, open challenges, Report Opponent |
| `/ludo.html` | Ludo Royale game view |
| `/snake-ladder.html` | Snake & Ladder game view |
| `/profile.html` | Account info + KYC status |
| `/admin.html` | **Admin Console** (see below) |

## Admin Console (`/admin.html`)

Passcode-gated. Default passcode: `winzo-admin-2026` (change from **Settings** tab immediately).

Sidebar sections:

- **Dashboard** — KPIs (users, open challenges, pending reports, pending withdrawals) + latest transactions
- **Setup** — Deposit transaction report · All tournaments · Running tournaments challenges · Black listed names
- **Game Management** — View all games · Add new game · View all tournament games · Add new tournament game
- **User Management** — View all users · Add new user · Review KYC users · View all fraud users · View wallet-mismatch users
- **Challenge Management** — Last 24 hour challenges · Running challenges · Search challenges · Search screenshots · View all challenges
- **Transaction Management** — Last 2 hour deposits · Recent withdraw requests · View all deposits · View all withdraw requests · Manual deposit by admin · Manual withdraw by haoda · Manual withdraw by admin
- **Settings** — Bonus contact phone · Admin passcode

## Firebase Setup (add later)

Replace the placeholder object inside `/public/js/firebase-config.js`:

```js
window.WINZO_FIREBASE_CONFIG = {
  apiKey:            "YOUR_FIREBASE_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

Get these values from Firebase Console → Project Settings → General → Your apps → Web app → SDK setup and configuration.

### Recommended Firebase services
- **Authentication** — Email/Password (already wired) and optional Phone OTP.
- **Firestore** — for `users`, `challenges`, `reports`, `tournaments`, `deposits`, `withdraws`, `games`, `blacklist`.
- **Storage** — path `kyc/{uid}/{filename}` for KYC docs; `reports/{uid}/{filename}` for win-proof screenshots.

### Suggested Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read, write: if request.auth.token.admin == true;
    }
    match /challenges/{id} { allow read, create: if request.auth != null;
      allow update: if request.auth != null && (resource.data.uid == request.auth.uid || request.auth.token.admin == true); }
    match /reports/{id}    { allow create: if request.auth != null;
      allow read, update: if request.auth.token.admin == true; }
  }
}
```

### Storage rules
```
match /kyc/{uid}/{file=**}      { allow write: if request.auth.uid == uid; allow read: if request.auth.token.admin == true; }
match /reports/{uid}/{file=**}  { allow write: if request.auth.uid == uid; allow read: if request.auth.token.admin == true; }
```

## Environment variables (commented, add later)

`/public/js/firebase-config.js` currently uses inline placeholders. If you prefer runtime env injection at deploy time:

```
# .env (used by your deploy pipeline to render firebase-config.js)
# FIREBASE_API_KEY=
# FIREBASE_AUTH_DOMAIN=
# FIREBASE_PROJECT_ID=
# FIREBASE_STORAGE_BUCKET=
# FIREBASE_MESSAGING_SENDER_ID=
# FIREBASE_APP_ID=
# ADMIN_PASSCODE=              # optional; overrides default 'winzo-admin-2026'
# BONUS_CONTACT_PHONE=         # optional; overrides default '+91 99999 99999'
```

## Local dev

`yarn start` inside `/frontend` → serves `/public` on port 3000 via `http-server`.

## Data persistence today (before Firebase)

| localStorage key | Purpose |
|---|---|
| `winzo_users` | Registered users |
| `winzo_session` | Current session |
| `winzo_sets_global` | Set-a-Game challenge pool |
| `winzo_reports` | Report Opponent submissions |
| `winzo_settings` | Bonus phone + admin passcode |
| `winzo_games` | Configured games |
| `winzo_tournaments` | Tournament list |
| `winzo_deposits` / `winzo_withdraws` | Transactions |
| `winzo_blacklist` | Banned usernames |

When Firebase is wired, these will be mirrored to Firestore collections of the same names.
