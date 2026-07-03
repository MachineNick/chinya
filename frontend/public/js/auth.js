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
  if (window.WINZO_FIREBASE_READY && window.WINZO_STORAGE) {
    const ref = window.WINZO_STORAGE.ref(`kyc/${uid}/${Date.now()}-${file.name}`);
    const snap = await ref.put(file);
    return await snap.ref.getDownloadURL();
  }
  // Fallback: convert to base64 data URL and store locally.
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function wzSignup(payload) {
  // payload: { fullName, phone, email, password, kycType, kycFile }
  const users = wzGetUsers();
  if (users.find(u => u.email === payload.email || u.phone === payload.phone)) {
    throw new Error("An account with this email or phone already exists.");
  }
  const uid = "u_" + Date.now();
  const kycUrl = payload.kycFile
    ? await wzUploadKycFile(payload.kycFile, uid)
    : null;

  // Optional Firebase Auth if configured
  if (window.WINZO_FIREBASE_READY && window.WINZO_AUTH) {
    try {
      await window.WINZO_AUTH.createUserWithEmailAndPassword(payload.email, payload.password);
      if (window.WINZO_STORE) {
        await window.WINZO_STORE.collection("users").doc(uid).set({
          fullName: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          kycType: payload.kycType,
          kycUrl,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firebase auth failed, using local fallback:", e.message);
    }
  }

  const user = {
    uid,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    password: payload.password, // demo only – hash in production
    kycType: payload.kycType,
    kycUrl,
    kycVerified: !!kycUrl,
    wallet: 500, // welcome bonus
    createdAt: new Date().toISOString()
  };
  users.push(user);
  wzSaveUsers(users);
  wzSetSession({ ...user, password: undefined });
  return user;
}

async function wzLogin(identifier, password) {
  const users = wzGetUsers();
  const user = users.find(
    u => (u.email === identifier || u.phone === identifier) && u.password === password
  );
  if (!user) throw new Error("Invalid credentials. Please try again.");

  if (window.WINZO_FIREBASE_READY && window.WINZO_AUTH) {
    try { await window.WINZO_AUTH.signInWithEmailAndPassword(user.email, password); }
    catch (e) { console.warn("Firebase login skipped:", e.message); }
  }
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
  toast: wzToast
};
