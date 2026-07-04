// ============================================================
// WinzoIndia Admin v2 — Static Data
// TODO: Replace all static arrays below with Firebase Firestore
// reads once Firebase is configured in firebase-config.js.
// Required env vars (add to .env and firebase-config.js):
//   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
//   FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
// ============================================================

const STATIC = {
  users: [
    { uid:"u1", name:"Rahul Sharma",   phone:"9876543210", email:"rahul@example.com",  kyc:"Aadhaar", kycStatus:"verified",  chips:4200, wallet:1800, status:"active",  fraud:false, walletMismatch:false, joined:"2026-01-10" },
    { uid:"u2", name:"Priya Singh",    phone:"9123456780", email:"priya@example.com",  kyc:"PAN",     kycStatus:"pending",   chips:800,  wallet:800,  status:"active",  fraud:false, walletMismatch:false, joined:"2026-02-14" },
    { uid:"u3", name:"Amit Verma",     phone:"9988776655", email:"amit@example.com",   kyc:"DL",      kycStatus:"rejected",  chips:0,    wallet:500,  status:"blocked", fraud:true,  walletMismatch:false, joined:"2026-03-01" },
    { uid:"u4", name:"Sneha Patel",    phone:"9001122334", email:"sneha@example.com",  kyc:"Aadhaar", kycStatus:"verified",  chips:12000,wallet:5000, status:"active",  fraud:false, walletMismatch:true,  joined:"2026-03-20" },
    { uid:"u5", name:"Vikram Yadav",   phone:"9765432100", email:"vikram@example.com", kyc:"Passport",kycStatus:"pending",   chips:300,  wallet:900,  status:"active",  fraud:false, walletMismatch:false, joined:"2026-04-05" },
  ],
  games: [
    { id:"g1", name:"Ludo Classic",      type:"regular",    entry:50,   prize:90,   status:"active",   players:4, created:"2026-01-01" },
    { id:"g2", name:"Snake & Ladder",    type:"regular",    entry:20,   prize:36,   status:"active",   players:2, created:"2026-01-05" },
    { id:"g3", name:"Ludo Tournament",   type:"tournament", entry:100,  prize:5000, status:"active",   players:64,created:"2026-02-10" },
    { id:"g4", name:"Speed Ludo Cup",    type:"tournament", entry:200,  prize:15000,status:"running",  players:32,created:"2026-03-15" },
    { id:"g5", name:"Ludo Blitz",        type:"regular",    entry:10,   prize:18,   status:"inactive", players:2, created:"2026-04-01" },
  ],
  challenges: [
    { id:"c1", player1:"Rahul Sharma",  player2:"Priya Singh",  game:"Ludo Classic",   amount:100, status:"running",   time:"2026-07-04 10:00", screenshot:"" },
    { id:"c2", player1:"Amit Verma",    player2:"Sneha Patel",  game:"Snake & Ladder", amount:50,  status:"completed", time:"2026-07-04 09:30", screenshot:"" },
    { id:"c3", player1:"Vikram Yadav",  player2:"Rahul Sharma", game:"Ludo Classic",   amount:200, status:"running",   time:"2026-07-04 11:00", screenshot:"" },
    { id:"c4", player1:"Priya Singh",   player2:"Vikram Yadav", game:"Ludo Blitz",     amount:30,  status:"disputed",  time:"2026-07-03 22:00", screenshot:"" },
    { id:"c5", player1:"Sneha Patel",   player2:"Amit Verma",   game:"Ludo Classic",   amount:500, status:"completed", time:"2026-07-03 18:00", screenshot:"" },
  ],
  deposits: [
    { id:"d1", user:"Rahul Sharma",  amount:500,  method:"UPI",    status:"success", time:"2026-07-04 11:30" },
    { id:"d2", user:"Priya Singh",   amount:200,  method:"UPI",    status:"success", time:"2026-07-04 11:00" },
    { id:"d3", user:"Sneha Patel",   amount:1000, method:"IMPS",   status:"pending", time:"2026-07-04 10:45" },
    { id:"d4", user:"Vikram Yadav",  amount:100,  method:"UPI",    status:"failed",  time:"2026-07-04 09:00" },
    { id:"d5", user:"Rahul Sharma",  amount:2000, method:"NEFT",   status:"success", time:"2026-07-03 20:00" },
    { id:"d6", user:"Amit Verma",    amount:300,  method:"UPI",    status:"success", time:"2026-07-03 15:00" },
  ],
  withdrawals: [
    { id:"w1", user:"Rahul Sharma",  amount:400,  method:"UPI",  upi:"rahul@upi",  status:"pending",  time:"2026-07-04 11:20" },
    { id:"w2", user:"Sneha Patel",   amount:2000, method:"Bank", upi:"—",          status:"approved", time:"2026-07-04 10:00" },
    { id:"w3", user:"Priya Singh",   amount:150,  method:"UPI",  upi:"priya@upi",  status:"pending",  time:"2026-07-04 09:30" },
    { id:"w4", user:"Vikram Yadav",  amount:800,  method:"UPI",  upi:"vikram@upi", status:"rejected", time:"2026-07-03 22:00" },
  ],
  tournaments: [
    { id:"t1", name:"Ludo Grand Prix",   game:"Ludo Classic",  entry:100, prize:5000,  players:"48/64", status:"running",  start:"2026-07-04 10:00" },
    { id:"t2", name:"Speed Ludo Cup",    game:"Ludo Blitz",    entry:200, prize:15000, players:"32/32", status:"running",  start:"2026-07-04 09:00" },
    { id:"t3", name:"Snake Ladder Open", game:"Snake & Ladder",entry:50,  prize:2000,  players:"16/32", status:"upcoming", start:"2026-07-05 18:00" },
    { id:"t4", name:"Ludo Classic Open", game:"Ludo Classic",  entry:100, prize:8000,  players:"64/64", status:"completed",start:"2026-07-03 10:00" },
  ],
  blacklisted: [
    { id:"b1", name:"admin",      reason:"Reserved word",       added:"2026-01-01" },
    { id:"b2", name:"winzo",      reason:"Brand name",          added:"2026-01-01" },
    { id:"b3", name:"hack3r99",   reason:"Abusive / cheat",     added:"2026-03-10" },
    { id:"b4", name:"fakeuser",   reason:"Fraud account",       added:"2026-04-02" },
  ],
};

// Helpers
function now() { return new Date().toLocaleString("en-IN"); }
function rupee(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
function statusBadge(s) {
  const map = {
    active:"badge-green", running:"badge-blue", completed:"badge-green",
    pending:"badge-yellow", success:"badge-green", approved:"badge-green",
    failed:"badge-red", rejected:"badge-red", disputed:"badge-red",
    blocked:"badge-red", upcoming:"badge-yellow", inactive:"badge-red",
    verified:"badge-green", "not-submitted":"badge-yellow"
  };
  return `<span class="badge ${map[s]||'badge-yellow'}">${s}</span>`;
}
function emptyRow(cols, msg="No records found.") {
  return `<tr class="empty-row"><td colspan="${cols}">${msg}</td></tr>`;
}
