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
function wzSaveSettings(patch) {
  const cur = wzGetSettings();
  localStorage.setItem(WZ_SETTINGS_KEY, JSON.stringify({ ...cur, ...patch }));
}
window.WinzoSettings = { get: wzGetSettings, save: wzSaveSettings };

// ---- Global sets pool ----
const WZ_SETS_KEY = "winzo_sets_global";
function wzGetSets() {
  try { return JSON.parse(localStorage.getItem(WZ_SETS_KEY) || "[]"); }
  catch { return []; }
}
function wzSaveSets(arr) { localStorage.setItem(WZ_SETS_KEY, JSON.stringify(arr)); }
window.WinzoSets = { get: wzGetSets, save: wzSaveSets };

// ---- Reports ----
const WZ_REPORTS_KEY = "winzo_reports";
function wzGetReports() {
  try { return JSON.parse(localStorage.getItem(WZ_REPORTS_KEY) || "[]"); }
  catch { return []; }
}
function wzSaveReports(arr) { localStorage.setItem(WZ_REPORTS_KEY, JSON.stringify(arr)); }
window.WinzoReports = { get: wzGetReports, save: wzSaveReports };
