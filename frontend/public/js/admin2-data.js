// ============================================================
// WinzoIndia Admin v2 — Data Layer
// Users, sets, reports are read LIVE from localStorage (synced
// with signup/dashboard). Static seeds used for games/tournaments
// until Firebase Firestore is wired in.
// TODO: Replace getData() calls with Firestore queries once
// Firebase credentials are added to firebase-config.js.
// Required env vars:
//   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
//   FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
// ============================================================

// ── Live localStorage readers (same keys as auth.js) ─────────
function getLiveUsers() {
  try { return JSON.parse(localStorage.getItem("winzo_users") || "[]"); } catch(e) { return []; }
}
function getLiveSets() {
  try { return JSON.parse(localStorage.getItem("winzo_sets_global") || "[]"); } catch(e) { return []; }
}
function getLiveReports() {
  try { return JSON.parse(localStorage.getItem("winzo_reports") || "[]"); } catch(e) { return []; }
}
function getLiveDeposits() {
  try { return JSON.parse(localStorage.getItem("winzo_deposits") || "[]"); } catch(e) { return []; }
}
function getLiveWithdrawals() {
  try { return JSON.parse(localStorage.getItem("winzo_withdraws") || "[]"); } catch(e) { return []; }
}
function getLiveBlacklist() {
  try { return JSON.parse(localStorage.getItem("winzo_blacklist") || "[]"); } catch(e) { return []; }
}
function saveLiveBlacklist(arr) {
  localStorage.setItem("winzo_blacklist", JSON.stringify(arr));
}
function saveLiveUsers(arr) {
  localStorage.setItem("winzo_users", JSON.stringify(arr));
}

// ── Static seeds (games & tournaments — no live source yet) ──
const STATIC = {
  games: [
    { id:"g1", name:"Full Game",      type:"regular",    entry:50,  prize:90,   status:"active", players:4, created:"2026-01-01" },
    { id:"g2", name:"1 Goti",         type:"regular",    entry:20,  prize:36,   status:"active", players:2, created:"2026-01-01" },
    { id:"g3", name:"2 Goti",         type:"regular",    entry:30,  prize:54,   status:"active", players:2, created:"2026-01-01" },
    { id:"g4", name:"3 Goti",         type:"regular",    entry:40,  prize:72,   status:"active", players:2, created:"2026-01-01" },
    { id:"g5", name:"Ulta",           type:"regular",    entry:50,  prize:90,   status:"active", players:2, created:"2026-01-01" },
    { id:"g6", name:"1 Six",          type:"regular",    entry:20,  prize:36,   status:"active", players:2, created:"2026-01-01" },
    { id:"g7", name:"Snake & Ladder", type:"regular",    entry:20,  prize:36,   status:"active", players:2, created:"2026-01-01" },
  ],
  tournaments: [
    { id:"t1", name:"Full Game Grand Prix",   game:"Full Game",      entry:100, prize:5000,  players:"48/64", status:"running",   start:"2026-07-04 10:00" },
    { id:"t2", name:"1 Goti Speed Cup",       game:"1 Goti",         entry:50,  prize:2000,  players:"32/64", status:"upcoming",  start:"2026-07-05 18:00" },
    { id:"t3", name:"Snake Ladder Open",      game:"Snake & Ladder", entry:50,  prize:2000,  players:"16/32", status:"upcoming",  start:"2026-07-05 20:00" },
    { id:"t4", name:"Ulta Championship",      game:"Ulta",           entry:100, prize:8000,  players:"64/64", status:"completed", start:"2026-07-03 10:00" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────
function rupee(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }

function statusBadge(s) {
  const map = {
    active:"badge-green", running:"badge-blue", completed:"badge-green",
    pending:"badge-yellow", success:"badge-green", approved:"badge-green",
    failed:"badge-red", rejected:"badge-red", disputed:"badge-red",
    blocked:"badge-red", upcoming:"badge-yellow", inactive:"badge-red",
    verified:"badge-green", "not-submitted":"badge-yellow"
  };
  return `<span class="badge ${map[s]||"badge-yellow"}">${s}</span>`;
}

function emptyRow(cols, msg) {
  return `<tr class="empty-row"><td colspan="${cols}">${msg||"No records found."}</td></tr>`;
}
