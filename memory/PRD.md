# WinzoIndia — PRD

## Original problem statement
> create me an website which should be static that mean in html, css, js. its name is WinzoIndia. its an online gaming app, firstly it will ask for login, signup, the login process is easy Fullname, phone number, upload document for kyc verification, email. and the documents will be stored in flutter firebase. make it accordingly professional.

## User choices
- Pure static **HTML / CSS / vanilla JS** with **Firebase Web SDK**
- Firebase config kept as placeholder env vars (`/public/js/firebase-config.js`) — user will fill later
- Games featured: **Ludo**, **Snake & Ladder** (professional presentations)
- KYC document types: **Aadhaar, PAN, Driving Licence, Passport**
- Bold **dark theme + neon-gold** WinzoIndia-style aesthetic

## Architecture
- Frontend served by **`http-server`** on port 3000 (replaces React dev server).
- Firebase (compat v10.14.1) loaded from CDN in every page for **Auth**, **Firestore**, **Storage**.
- Graceful fallback: if Firebase credentials aren't set, everything works with **localStorage** (users, session, KYC as base64 data URL) so the app is fully demoable without setup.
- No backend — pure client-side.

## User personas
- **Player** — signs up, uploads KYC, plays skill-money games.
- **Compliance officer** (future) — reviews KYC docs; access controlled via Firebase security rules.

## Core requirements (static)
1. Multi-page site (7 pages): landing, signup, login, dashboard, ludo, snake-ladder, profile.
2. Signup captures Full Name, Phone, Email, Password, KYC type + file upload.
3. Firebase Auth + Storage integration once credentials are added.
4. Professional gold/black aesthetic with Unbounded + Outfit fonts + Phosphor icons.

## What's been implemented (2026-02-07)
- Full 7-page static site under `/app/frontend/public/`.
- `css/style.css` — complete design system (dark + gold, glassmorphism, animations).
- `js/firebase-config.js` — Firebase init with placeholder config + graceful fallback.
- `js/auth.js` — signup/login/logout/KYC upload (Firebase + localStorage fallback).
- `js/main.js` — nav profile chip, formatting helpers, global logout wiring.
- End-to-end tested: signup → dashboard → ludo/snake game view → profile → logout.
- `http-server` installed and wired to `yarn start` via `package.json`.

## Prioritised backlog
### P0 (next up when user is ready)
- Add real Firebase credentials to `js/firebase-config.js` (or expose them via a JSON env-injector at deploy).
- Enforce Firebase Storage security rules on `kyc/{uid}/**`.

### P1
- Actual game logic: playable Ludo + Snake & Ladder using HTML5 canvas.
- Wallet: deposit / withdraw via Razorpay or Stripe.
- Phone-OTP login (Firebase phone auth).

### P2
- Leaderboards, tournaments engine, referral programme.
- Push notifications for match invites.
- Multi-language (Hindi, Tamil, Bengali).

## File map
```
/app/frontend/public
├── index.html           # Landing
├── signup.html          # Fullname + phone + email + KYC upload
├── login.html           # Email/phone + password
├── dashboard.html       # Wallet, promo, game grid, stats
├── ludo.html            # Ludo game view
├── snake-ladder.html    # Snake & Ladder game view
├── profile.html         # Account + KYC status
├── css/style.css        # Design system
└── js/
    ├── firebase-config.js
    ├── auth.js
    └── main.js
```
