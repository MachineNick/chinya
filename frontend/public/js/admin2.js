// ============================================================
// WinzoIndia Admin v2 — Main Controller
// ============================================================

// ── Define globals first so unlock() can call them ───────────
window.loadPanel = function (key, label) {
  document.getElementById("topbar-title").textContent = label || key;
  var content = document.getElementById("main-content");
  if (PANELS[key]) {
    content.innerHTML = PANELS[key]();
  } else {
    content.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;">Panel not found: ' + key + '</div>';
  }
};

window.showToast = function (msg, type) {
  if (window.WinzoAuth && window.WinzoAuth.toast) {
    window.WinzoAuth.toast(msg, type || "info");
  } else { alert(msg); }
};

window.filterTable = function (input, tbodyId) {
  var cols = Array.prototype.slice.call(arguments, 2);
  var q = input.value.toLowerCase();
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (row) {
    var cells = row.querySelectorAll("td");
    var match = cols.some(function (ci) { return cells[ci] && cells[ci].textContent.toLowerCase().includes(q); });
    row.style.display = match ? "" : "none";
  });
};

window.adminViewKyc = async function (key) {
  try {
    var res = await fetch("http://localhost:8001/api/kyc/url?key=" + encodeURIComponent(key));
    var data = await res.json();
    window.open(data.url, "_blank");
  } catch (e) { showToast("Could not load document. Backend may be offline.", "error"); }
};

window.approveWithdrawRequest = function(id) {
  var wds = getLiveWithdrawals();
  var w = wds.find(function(x){ return x.id === id; });
  if (!w) return;
  w.status = "approved";
  // Deduct chips from user
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.fullName === w.user || x.phone === w.userPhone || x.email === w.userEmail; });
  if (u) {
    u.chips = Math.max(0, (Number(u.chips) || 0) - Number(w.amount));
    u.wallet = u.chips;
    saveLiveUsers(users);
    if (window.WINZO_SB) window.WINZO_SB.from("users").update({ chips: u.chips }).eq("uid", u.uid).then(function(){});
  }
  localStorage.setItem("winzo_withdraws", JSON.stringify(wds));
  if (window.WINZO_SB) window.WINZO_SB.from("withdraws").update({ status: "approved" }).eq("id", id).then(function(){});
  showToast("Withdrawal approved & ₹" + w.amount + " deducted from " + w.user, "success");
  window.syncAndReload("recent-withdrawals", "Recent Withdrawal Requests");
};

window.rejectWithdrawRequest = function(id) {
  var wds = getLiveWithdrawals();
  var w = wds.find(function(x){ return x.id === id; });
  if (!w) return;
  w.status = "rejected";
  localStorage.setItem("winzo_withdraws", JSON.stringify(wds));
  if (window.WINZO_SB) window.WINZO_SB.from("withdraws").update({ status: "rejected" }).eq("id", id).then(function(){});
  showToast("Withdrawal rejected.", "error");
  window.syncAndReload("recent-withdrawals", "Recent Withdrawal Requests");
};

window.approveDepositRequest = function(id) {
  var deps = getLiveDeposits();
  var d = deps.find(function(x){ return x.id === id; });
  if (!d) return;
  d.status = "success";
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.fullName === d.user || x.phone === d.userPhone || x.email === d.userEmail; });
  if (u) { u.chips = (Number(u.chips) || 0) + Number(d.amount); u.wallet = u.chips; saveLiveUsers(users); }
  localStorage.setItem("winzo_deposits", JSON.stringify(deps));
  if (window.WINZO_SB) {
    window.WINZO_SB.from("deposits").update({ status:"success" }).eq("id", id).then(function(){});
  }
  showToast("Approved & " + d.amount + " chips credited to " + d.user, "success");
  window.syncAndReload("new-deposit-requests", "New Deposit Requests");
};

window.rejectDepositRequest = function(id) {
  var deps = getLiveDeposits();
  var d = deps.find(function(x){ return x.id === id; });
  if (!d) return;
  d.status = "rejected";
  localStorage.setItem("winzo_deposits", JSON.stringify(deps));
  if (window.WINZO_SB) {
    window.WINZO_SB.from("deposits").update({ status:"rejected" }).eq("id", id).then(function(){});
  }
  showToast("Request rejected.", "error");
  window.syncAndReload("new-deposit-requests", "New Deposit Requests");
};

window.adminDeleteUser = function (uid) {
  if (!confirm("Delete this user permanently?")) return;
  saveLiveUsers(getLiveUsers().filter(function(u){ return u.uid !== uid; }));
  showToast("User deleted", "success");
  window.loadPanel("view-all-users", "View All Users");
};

window.adminChipOp = function (uid, direction) {
  var amt = Number(document.getElementById("chipamt-" + uid)?.value);
  if (!amt || amt < 1) return showToast("Enter a valid amount.", "error");
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (!u) return;
  u.chips = Math.max(0, (Number(u.chips ?? u.wallet) || 0) + (direction * amt));
  u.wallet = u.chips;
  saveLiveUsers(users);
  if (window.WINZO_SB) window.WINZO_SB.from("users").update({ chips: u.chips }).eq("uid", uid).then(function(){});
  // Log to transaction history
  var txns = getLiveDeposits();
  txns.unshift({
    id: "txn_" + Date.now(),
    user: u.fullName || u.name,
    userPhone: u.phone || "—",
    userEmail: u.email || "—",
    amount: amt,
    type: direction > 0 ? "Admin Add" : "Admin Subtract",
    method: "Admin Panel",
    status: "success",
    time: new Date().toLocaleString("en-IN")
  });
  localStorage.setItem("winzo_deposits", JSON.stringify(txns));
  var el = document.getElementById("chips-" + uid);
  if (el) el.textContent = u.chips.toLocaleString("en-IN");
  showToast((direction > 0 ? "Added " : "Subtracted ") + amt + " chips " + (direction > 0 ? "to " : "from ") + (u.fullName || u.name) + ". Balance: " + u.chips, "success");
};

window.adminDeleteSet = function (id) {
  var sets = getLiveSets().filter(function(s){ return s.id !== id; });
  localStorage.setItem("winzo_sets_global", JSON.stringify(sets));
  showToast("Challenge deleted", "success");
  window.loadPanel("all-challenges", "View All Challenges");
};

window.adminToggleKyc = function (uid, approve) {
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (!u) return;
  u.kycVerified = approve;
  if (approve) { delete u.kycRejected; } else { u.kycRejected = true; }
  saveLiveUsers(users);
  if (window.WINZO_SB) window.WINZO_SB.from("users").update({ kyc_verified: approve }).eq("uid", uid).then(function(){});
  var session = JSON.parse(localStorage.getItem("winzo_session") || "null");
  if (session && session.uid === uid) {
    session.kycVerified = approve;
    localStorage.setItem("winzo_session", JSON.stringify(session));
  }
  var badge = document.getElementById("kyc-badge-" + uid);
  if (badge) badge.innerHTML = approve
    ? '<span class="badge badge-green">verified</span>'
    : '<span class="badge badge-yellow">pending</span>';
  var btn = badge && badge.closest("tr").querySelector("td:last-child button:first-child");
  if (btn) btn.outerHTML = approve
    ? `<button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="adminToggleKyc('${uid}',false)"><i class="ph ph-x-circle"></i> Revoke KYC</button>`
    : `<button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="adminToggleKyc('${uid}',true)"><i class="ph ph-check-circle"></i> Approve KYC</button>`;
  showToast(approve ? "KYC approved ✓" : "KYC revoked", approve ? "success" : "error");
};

window.adminRejectKyc = function (uid) {
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (u) {
    u.kycVerified = false;
    u.kycRejected = true;
    u.kycUrl = null;
    u.kycKey = null;
    saveLiveUsers(users);
    var session = JSON.parse(localStorage.getItem("winzo_session") || "null");
    if (session && session.uid === uid) {
      session.kycVerified = false; session.kycRejected = true;
      localStorage.setItem("winzo_session", JSON.stringify(session));
    }
  }
  showToast("KYC rejected — user must re-upload", "error");
  window.loadPanel("review-kyc", "Review KYC Users");
};

window.adminApproveKyc = function (uid) {
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (u) {
    u.kycVerified = true;
    saveLiveUsers(users);
    var session = JSON.parse(localStorage.getItem("winzo_session") || "null");
    if (session && session.uid === uid) {
      session.kycVerified = true;
      localStorage.setItem("winzo_session", JSON.stringify(session));
    }
    if (window.WINZO_SB) window.WINZO_SB.from("users").update({ kyc_verified: true }).eq("uid", uid).then(function(){});
  }
  showToast("KYC approved", "success");
  window.loadPanel("review-kyc", "Review KYC Users");
};

window.adminSaveSettings = function () {
  var bonusPhone = document.getElementById("set-bonus-phone").value.trim();
  var adminPass  = document.getElementById("set-admin-pass").value.trim();
  var upiId      = document.getElementById("set-upi-id").value.trim();
  var upiName    = document.getElementById("set-upi-name").value.trim();
  if (!bonusPhone || !adminPass) return showToast("Bonus phone and passcode are required.", "error");
  if (window.WinzoSettings) window.WinzoSettings.save({ bonusPhone, adminPass, upiId, upiName });
  showToast("Settings saved!", "success");
};

window.adminManualDeposit = function () {
  var uid = document.getElementById("md-user").value;
  var amt = Number(document.getElementById("md-amount").value);
  if (!uid || !amt || amt < 1) { showToast("Select user and enter valid amount", "error"); return; }
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (!u) return;
  u.chips = Number(u.chips || 0) + amt;
  u.wallet = Number(u.wallet || 0) + amt;
  saveLiveUsers(users);
  var deps = getLiveDeposits();
  deps.push({ id: "d_" + Date.now(), user: u.fullName || u.name, amount: amt, method: "Admin", status: "success", time: new Date().toLocaleString("en-IN") });
  localStorage.setItem("winzo_deposits", JSON.stringify(deps));
  showToast("₹" + amt.toLocaleString("en-IN") + " added to " + (u.fullName || u.name), "success");
};

window.adminManualWithdraw = function () {
  var uid = document.getElementById("mwa-user").value;
  var amt = Number(document.getElementById("mwa-amount").value);
  if (!uid || !amt || amt < 1) { showToast("Select user and enter valid amount", "error"); return; }
  var users = getLiveUsers();
  var u = users.find(function(x){ return x.uid === uid; });
  if (!u) return;
  u.chips = Math.max(0, Number(u.chips || 0) - amt);
  u.wallet = Math.max(0, Number(u.wallet || 0) - amt);
  saveLiveUsers(users);
  var wds = getLiveWithdrawals();
  wds.push({ id: "w_" + Date.now(), user: u.fullName || u.name, amount: amt, method: "Admin", status: "approved", time: new Date().toLocaleString("en-IN") });
  localStorage.setItem("winzo_withdraws", JSON.stringify(wds));
  showToast("₹" + amt.toLocaleString("en-IN") + " withdrawn from " + (u.fullName || u.name), "success");
};

window.adminAddUser = function () {
  var name  = document.getElementById("nu-name").value.trim();
  var phone = document.getElementById("nu-phone").value.trim();
  var email = document.getElementById("nu-email").value.trim();
  var pass  = document.getElementById("nu-pass").value;
  var kyc   = document.getElementById("nu-kyc").value;
  var chips = Number(document.getElementById("nu-chips").value) || 0;
  if (!name || !phone || !email || !pass) { showToast("Fill all required fields", "error"); return; }
  var users = getLiveUsers();
  if (users.find(function(u){ return u.email === email || u.phone === phone; })) {
    showToast("User with this email/phone already exists", "error"); return;
  }
  users.push({ uid: "u_" + Date.now(), fullName: name, phone: phone, email: email, password: pass, kycType: kyc, kycVerified: false, chips: chips, wallet: chips, createdAt: new Date().toISOString() });
  saveLiveUsers(users);
  showToast("User \"" + name + "\" created", "success");
  window.loadPanel("view-all-users", "View All Users");
};

window.adminAddGame = function () {
  var name    = (document.getElementById("ng-name")?.value || "").trim();
  var type    = document.getElementById("ng-type")?.value || "regular";
  var entry   = Number(document.getElementById("ng-entry")?.value || 0);
  var prize   = Number(document.getElementById("ng-prize")?.value || 0);
  var players = Number(document.getElementById("ng-players")?.value || 2);
  var status  = document.getElementById("ng-status")?.value || "active";
  if (!name) return showToast("Game name is required.", "error");
  var games = JSON.parse(localStorage.getItem("winzo_games") || "null") || STATIC.games.slice();
  games.push({ id: "g_" + Date.now(), name, type, entry, prize, players, status, created: new Date().toISOString().slice(0,10) });
  localStorage.setItem("winzo_games", JSON.stringify(games));
  showToast("Game \"" + name + "\" added and live on homepage.", "success");
  window.loadPanel("view-all-games", "View All Games");
};

window.adminDeleteGame = function (id) {
  if (!confirm("Remove this game?")) return;
  var games = JSON.parse(localStorage.getItem("winzo_games") || "null") || STATIC.games.slice();
  localStorage.setItem("winzo_games", JSON.stringify(games.filter(function(g){ return g.id !== id; })));
  showToast("Game removed.", "success");
  window.loadPanel("view-all-games", "View All Games");
};

window.removeBlacklist = function (id) {
  var list = getLiveBlacklist().filter(function(b){ return b.id !== id; });
  saveLiveBlacklist(list);
  var row = document.getElementById("bl-" + id);
  if (row) row.remove();
  showToast("Name removed from blacklist", "success");
};

window.showAddBlacklist = function () {
  var name = prompt("Enter name to blacklist:");
  if (!name || !name.trim()) return;
  var reason = prompt("Reason:") || "Admin action";
  var list = getLiveBlacklist();
  var id = "b_" + Date.now();
  list.push({ id: id, name: name.trim(), reason: reason, added: new Date().toISOString().slice(0,10) });
  saveLiveBlacklist(list);
  var tbody = document.getElementById("blacklist-tbody");
  if (!tbody) return;
  var tr = document.createElement("tr");
  tr.id = "bl-" + id;
  tr.innerHTML = "<td>—</td><td><strong>" + name.trim() + "</strong></td><td>" + reason + "</td><td>" + new Date().toISOString().slice(0,10) + "</td>"
    + "<td><button class='btn btn-secondary' style='padding:5px 10px;font-size:11px;' onclick=\"removeBlacklist('" + id + "')\"><i class='ph ph-trash'></i> Remove</button></td>";
  tbody.appendChild(tr);
  showToast("\"" + name.trim() + "\" blacklisted", "success");
};

// ── Boot ─────────────────────────────────────────────────────
(function () {
  var GATE_KEY = "winzo_admin2_unlocked";
  var gateWrap = document.getElementById("gate-wrap");
  var dashWrap = document.getElementById("dash-wrap");

  function unlock() {
    gateWrap.style.display = "none";
    dashWrap.style.display = "flex";
    window.syncAndReload("overview", "Dashboard Overview");
  }

  if (sessionStorage.getItem(GATE_KEY) === "1") unlock();

  // Load settings from Supabase before passcode check
  if (window.WinzoSettings && window.WinzoSettings.load) {
    window.WinzoSettings.load().then(function() {
      if (sessionStorage.getItem(GATE_KEY) === "1") unlock();
    });
  }

  document.getElementById("gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var val = document.getElementById("passcode").value;
    var settings = window.WinzoSettings ? window.WinzoSettings.get() : {};
    var correctPass = (settings.adminPass && settings.adminPass.trim()) || "winzo-admin-2026";
    if (val === correctPass) {
      sessionStorage.setItem(GATE_KEY, "1");
      unlock();
    } else {
      // Retry after fresh Supabase load in case settings weren't loaded yet
      if (window.WinzoSettings && window.WinzoSettings.load) {
        window.WinzoSettings.load().then(function() {
          var fresh = window.WinzoSettings.get();
          var freshPass = (fresh.adminPass && fresh.adminPass.trim()) || "winzo-admin-2026";
          if (val === freshPass) {
            sessionStorage.setItem(GATE_KEY, "1");
            unlock();
          } else {
            var err = document.getElementById("gate-error");
            err.textContent = "Incorrect passcode.";
            err.style.display = "block";
          }
        });
      } else {
        var err = document.getElementById("gate-error");
        err.textContent = "Incorrect passcode.";
        err.style.display = "block";
      }
    }
  });

  document.querySelectorAll(".a2-nav-parent").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.dataset.group;
      var children = document.getElementById("group-" + group);
      var isOpen = children.classList.contains("open");
      document.querySelectorAll(".a2-nav-children").forEach(function (c) { c.classList.remove("open"); });
      document.querySelectorAll(".a2-nav-parent").forEach(function (b) { b.classList.remove("open"); });
      if (!isOpen) { children.classList.add("open"); btn.classList.add("open"); }
    });
  });

  document.querySelectorAll(".a2-nav-child").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".a2-nav-child").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      window.syncAndReload(btn.dataset.panel, btn.textContent.trim());
      if (window.innerWidth <= 900) document.getElementById("sidebar").classList.remove("open");
    });
  });

  document.getElementById("menu-toggle").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("open");
  });
})();
