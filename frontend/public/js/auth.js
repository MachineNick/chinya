// ==========================================================
// WinzoIndia - Auth utilities
// Uses Firebase when configured; else localStorage fallback.
// ==========================================================

const WZ_KEYS = {
  USERS: "winzo_users",
  SESSION: "winzo_session"
};

function wzGetUsers() {
  try { return JSON.parse(localStorage.getItem(WZ_KEYS.USERS) || "[]"); }
  catch { return []; }
}
function wzSaveUsers(users) {
  localStorage.setItem(WZ_KEYS.USERS, JSON.stringify(users));
}
function wzSetSession(user) {
  localStorage.setItem(WZ_KEYS.SESSION, JSON.stringify(user));
}
function wzGetSession() {
  try { return JSON.parse(localStorage.getItem(WZ_KEYS.SESSION) || "null"); }
  catch { return null; }
}
function wzClearSession() {
  localStorage.removeItem(WZ_KEYS.SESSION);
}

function wzRequireAuth() {
  const session = wzGetSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

function wzRedirectIfAuthed() {
  if (wzGetSession()) window.location.href = "dashboard.html";
}

function wzToast(msg, type = "info", ms = 3200) {
  let node = document.getElementById("wz-toast");
  if (!node) {
    node = document.createElement("div");
    node.id = "wz-toast";
    node.className = "toast";
    node.setAttribute("data-testid", "wz-toast");
    document.body.appendChild(node);
  }
  node.textContent = msg;
  node.className = `toast ${type} show`;
  clearTimeout(node._t);
  node._t = setTimeout(() => node.classList.remove("show"), ms);
}

async function wzUploadKycFile(file, uid) {
  try {
    const form = new FormData();
    form.append("uid", uid);
    form.append("file", file);
    const res = await fetch("http://localhost:8001/api/kyc/upload", { method: "POST", body: form });
    if (res.ok) return await res.json(); // { kycUrl, kycKey }
  } catch (e) { /* fall through */ }
  // Fallback: base64
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { kycUrl: dataUrl, kycKey: null };
}

async function wzSignup(payload) {
  // payload: { fullName, phone, email, password, kycType, kycFile }
  const users = wzGetUsers();
  if (users.find(u => u.email === payload.email || u.phone === payload.phone)) {
    throw new Error("An account with this email or phone already exists.");
  }
  const uid = "u_" + Date.now();
  const kycResult = payload.kycFile
    ? await wzUploadKycFile(payload.kycFile, uid)
    : { kycUrl: null, kycKey: null };

  // ── Supabase Auth ──
  if (window.WINZO_SB) {
    try {
      const { data, error } = await window.WINZO_SB.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: { data: { fullName: payload.fullName, phone: payload.phone } }
      });
      if (error) throw new Error(error.message);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  const user = {
    uid,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    kycType: payload.kycType,
    kycUrl: kycResult.kycUrl,
    kycKey: kycResult.kycKey,
    kycVerified: false,
    chips: 0,
    wallet: 0,
    createdAt: new Date().toISOString()
  };

  // ── Supabase DB ──
  if (window.WINZO_SB) {
    try {
      await window.WINZO_SB.from("users").insert({
        uid, full_name: payload.fullName, phone: payload.phone,
        email: payload.email, kyc_type: payload.kycType,
        kyc_url: kycResult.kycUrl, kyc_verified: false,
        chips: 0, created_at: new Date().toISOString()
      });
    } catch(e) { console.warn("Supabase DB insert failed:", e.message); }
  }

  users.push(user);
  wzSaveUsers(users);
  wzSetSession({ ...user, password: undefined });
  return user;
}

async function wzLogin(identifier, password) {
  // ── Supabase Auth ──
  if (window.WINZO_SB) {
    try {
      const { data, error } = await window.WINZO_SB.auth.signInWithPassword({
        email: identifier.includes("@") ? identifier : undefined,
        phone: !identifier.includes("@") ? identifier : undefined,
        password
      });
      if (error) throw new Error(error.message);
      // Sync fresh user data from Supabase DB
      const { data: dbUser } = await window.WINZO_SB.from("users").select("*").eq("email", identifier).single();
      if (dbUser) {
        const users = wzGetUsers();
        const idx = users.findIndex(u => u.email === identifier);
        const merged = {
          uid: dbUser.uid, fullName: dbUser.full_name, phone: dbUser.phone,
          email: dbUser.email, kycType: dbUser.kyc_type, kycUrl: dbUser.kyc_url,
          kycVerified: dbUser.kyc_verified, chips: dbUser.chips || 0,
          wallet: dbUser.chips || 0, createdAt: dbUser.created_at, password
        };
        if (idx >= 0) users[idx] = merged; else users.push(merged);
        wzSaveUsers(users);
        wzSetSession({ ...merged, password: undefined });
        return merged;
      }
    } catch (e) {
      // Fall through to localStorage
      console.warn("Supabase login failed, trying local:", e.message);
    }
  }

  // ── localStorage fallback ──
  const users = wzGetUsers();
  const user = users.find(
    u => (u.email === identifier || u.phone === identifier) && u.password === password
  );
  if (!user) throw new Error("Invalid credentials. Please try again.");
  wzSetSession({ ...user, password: undefined });
  return user;
}

function wzLogout() {
  if (window.WINZO_FIREBASE_READY && window.WINZO_AUTH) {
    try { window.WINZO_AUTH.signOut(); } catch (e) { /* noop */ }
  }
  wzClearSession();
  window.location.href = "index.html";
}

// Expose to window
window.WinzoAuth = {
  signup: wzSignup,
  login: wzLogin,
  logout: wzLogout,
  session: wzGetSession,
  requireAuth: wzRequireAuth,
  redirectIfAuthed: wzRedirectIfAuthed,
  toast: wzToast,
  getUsers: wzGetUsers,
  saveUsers: wzSaveUsers,
  setSession: wzSetSession
};

// ---- Global settings (bonus phone, admin passcode) ----
const WZ_SETTINGS_KEY = "winzo_settings";
function wzGetSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(WZ_SETTINGS_KEY) || "{}");
    return {
      bonusPhone: s.bonusPhone || "+91 99999 99999",
      adminPass:  s.adminPass  || "winzo-admin-2026",
      upiId:      s.upiId      || "winzoindia@upi",
      upiName:    s.upiName    || "WinzoIndia"
    };
  } catch { return { bonusPhone: "+91 99999 99999", adminPass: "winzo-admin-2026", upiId: "winzoindia@upi", upiName: "WinzoIndia" }; }
}
async function wzLoadSettingsFromSupabase() {
  if (!window.WINZO_SB) return;
  try {
    const { data } = await window.WINZO_SB.from("settings").select("key,value");
    if (!data || !data.length) return;
    const s = {};
    data.forEach(function(r){ s[r.key] = r.value; });
    localStorage.setItem(WZ_SETTINGS_KEY, JSON.stringify(s));
  } catch(e) { console.warn("Settings load failed:", e.message); }
}
function wzSaveSettings(patch) {
  const cur = wzGetSettings();
  const merged = { ...cur, ...patch };
  localStorage.setItem(WZ_SETTINGS_KEY, JSON.stringify(merged));
  if (!window.WINZO_SB) return;
  Object.entries(patch).forEach(function([key, value]) {
    window.WINZO_SB.from("settings").upsert({ key, value }).then(function(){});
  });
}
window.WinzoSettings = { get: wzGetSettings, save: wzSaveSettings, load: wzLoadSettingsFromSupabase };

// ---- Global sets pool (Supabase + localStorage) ----
const WZ_SETS_KEY = "winzo_sets_global";
async function wzGetSetsAsync() {
  if (window.WINZO_SB) {
    try {
      const { data } = await window.WINZO_SB.from("challenges").select("*").order("at", { ascending: false });
      if (data) {
        const mapped = data.map(r => ({ id:r.id, gameId:r.game_id, uid:r.uid, byName:r.by_name, value:r.value, gameType:r.game_type, acceptedBy:r.accepted_by, acceptedByName:r.accepted_by_name, acceptedAt:r.accepted_at, roomCode:r.room_code, at:r.at }));
        localStorage.setItem(WZ_SETS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch(e) { console.warn("Supabase sets fetch failed:", e.message); }
  }
  try { return JSON.parse(localStorage.getItem(WZ_SETS_KEY) || "[]"); } catch { return []; }
}
function wzGetSets() {
  try { return JSON.parse(localStorage.getItem(WZ_SETS_KEY) || "[]"); } catch { return []; }
}
async function wzSaveSetsAsync(arr) {
  localStorage.setItem(WZ_SETS_KEY, JSON.stringify(arr));
  if (!window.WINZO_SB) return;
  // Upsert all
  try {
    const rows = arr.map(s => ({ id:s.id, game_id:s.gameId||null, uid:s.uid, by_name:s.byName, value:s.value, game_type:s.gameType, accepted_by:s.acceptedBy||null, accepted_by_name:s.acceptedByName||null, accepted_at:s.acceptedAt||null, room_code:s.roomCode||null, at:s.at }));
    await window.WINZO_SB.from("challenges").upsert(rows);
  } catch(e) { console.warn("Supabase sets save failed:", e.message); }
}
function wzSaveSets(arr) {
  localStorage.setItem(WZ_SETS_KEY, JSON.stringify(arr));
  wzSaveSetsAsync(arr);
}
async function wzDeleteSet(id) {
  const arr = (await wzGetSetsAsync()).filter(s => s.id !== id);
  localStorage.setItem(WZ_SETS_KEY, JSON.stringify(arr));
  if (!window.WINZO_SB) return;
  try { await window.WINZO_SB.from("challenges").delete().eq("id", id); } catch(e) { console.warn("Supabase set delete failed:", e.message); }
}
window.WinzoSets = { get: wzGetSets, getAsync: wzGetSetsAsync, save: wzSaveSets, delete: wzDeleteSet };

// ---- Deposits (Supabase + localStorage) ----
async function wzSaveDepositAsync(dep) {
  if (!window.WINZO_SB) return;
  try {
    await window.WINZO_SB.from("deposits").upsert({ id:dep.id, uid:dep.uid||null, user_name:dep.user, user_phone:dep.userPhone, user_email:dep.userEmail, amount:dep.amount, method:dep.method, txn_id:dep.txnId||null, status:dep.status });
  } catch(e) { console.warn("Supabase deposit save failed:", e.message); }
}
window.WinzoDeposits = { saveOne: wzSaveDepositAsync };

// ---- Results (Supabase + localStorage) ----
async function wzSaveResultAsync(res) {
  if (!window.WINZO_SB) return;
  try {
    await window.WINZO_SB.from("results").upsert({ id:res.id, challenge_id:res.challengeId, game_id:res.gameId||null, submitter_uid:res.submitterUid, submitter_name:res.submitterName, submitter_phone:res.submitterPhone, opponent_uid:res.opponentUid, opponent_name:res.opponentName, opponent_phone:res.opponentPhone, game_type:res.gameType, amount:res.amount, room_code:res.roomCode, result:res.result, proof_url:res.proofUrl, status:res.status });
  } catch(e) { console.warn("Supabase result save failed:", e.message); }
}
window.WinzoResults = { saveOne: wzSaveResultAsync };

// ---- Reports ----
const WZ_REPORTS_KEY = "winzo_reports";
function wzGetReports() {
  try { return JSON.parse(localStorage.getItem(WZ_REPORTS_KEY) || "[]"); } catch { return []; }
}
function wzSaveReports(arr) { localStorage.setItem(WZ_REPORTS_KEY, JSON.stringify(arr)); }
async function wzSaveReportAsync(rep) {
  if (!window.WINZO_SB) return;
  try {
    await window.WINZO_SB.from("reports").upsert({ id:rep.id, reporter_uid:rep.reporterUid, reporter_name:rep.reporterName, opponent:rep.opponent, details:rep.details, proof_url:rep.proofUrl, status:rep.status });
  } catch(e) { console.warn("Supabase report save failed:", e.message); }
}
window.WinzoReports = { get: wzGetReports, save: wzSaveReports, saveOne: wzSaveReportAsync };

// ---- Withdrawals ----
const WZ_WITHDRAWS_KEY = "winzo_withdraws";
function wzGetWithdraws() {
  try { return JSON.parse(localStorage.getItem(WZ_WITHDRAWS_KEY) || "[]"); } catch { return []; }
}
function wzSaveWithdraws(arr) { localStorage.setItem(WZ_WITHDRAWS_KEY, JSON.stringify(arr)); }
async function wzSaveWithdrawAsync(w) {
  if (!window.WINZO_SB) return;
  try {
    await window.WINZO_SB.from("withdraws").upsert({ id:w.id, uid:w.uid||null, user_name:w.user, user_phone:w.userPhone, user_email:w.userEmail, amount:w.amount, method:w.method, upi_id:w.upiId||null, status:w.status });
  } catch(e) { console.warn("Supabase withdraw save failed:", e.message); }
}
window.WinzoWithdraws = { get: wzGetWithdraws, save: wzSaveWithdraws, saveOne: wzSaveWithdrawAsync };
