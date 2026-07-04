// ============================================================
// WinzoIndia Admin v2 — Main Controller
// ============================================================

(function () {
  const GATE_KEY = "winzo_admin2_unlocked";
  const gateWrap = document.getElementById("gate-wrap");
  const dashWrap = document.getElementById("dash-wrap");

  function unlock() {
    gateWrap.style.display = "none";
    dashWrap.style.display = "flex";
    loadPanel("overview", "Dashboard Overview");
  }

  if (sessionStorage.getItem(GATE_KEY) === "1") unlock();

  document.getElementById("gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const settings = window.WinzoSettings ? window.WinzoSettings.get() : { adminPass: "winzo-admin-2026" };
    const val = document.getElementById("passcode").value;
    if (val === settings.adminPass) {
      sessionStorage.setItem(GATE_KEY, "1");
      unlock();
    } else {
      const err = document.getElementById("gate-error");
      err.textContent = "Incorrect passcode.";
      err.style.display = "block";
    }
  });

  // ── Sidebar accordion ──────────────────────────────────────
  document.querySelectorAll(".a2-nav-parent").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const group = btn.dataset.group;
      const children = document.getElementById("group-" + group);
      const isOpen = children.classList.contains("open");
      // close all
      document.querySelectorAll(".a2-nav-children").forEach(function (c) { c.classList.remove("open"); });
      document.querySelectorAll(".a2-nav-parent").forEach(function (b) { b.classList.remove("open"); });
      if (!isOpen) {
        children.classList.add("open");
        btn.classList.add("open");
      }
    });
  });

  // ── Panel navigation ───────────────────────────────────────
  document.querySelectorAll(".a2-nav-child").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".a2-nav-child").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      const panel = btn.dataset.panel;
      const label = btn.textContent.trim();
      loadPanel(panel, label);
      // close sidebar on mobile
      if (window.innerWidth <= 900) {
        document.getElementById("sidebar").classList.remove("open");
      }
    });
  });

  // ── Mobile menu toggle ─────────────────────────────────────
  document.getElementById("menu-toggle").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("open");
  });

  // ── Load panel ─────────────────────────────────────────────
  window.loadPanel = function (key, label) {
    document.getElementById("topbar-title").textContent = label || key;
    const content = document.getElementById("main-content");
    if (PANELS[key]) {
      content.innerHTML = PANELS[key]();
    } else {
      content.innerHTML = `<div style="color:var(--text-muted);padding:40px;text-align:center;">Panel not found: ${key}</div>`;
    }
  };

  // ── Toast ──────────────────────────────────────────────────
  window.showToast = function (msg, type) {
    if (window.WinzoAuth && window.WinzoAuth.toast) {
      window.WinzoAuth.toast(msg, type || "info");
    } else {
      alert(msg);
    }
  };

  // ── Table filter ───────────────────────────────────────────
  window.filterTable = function (input, tbodyId) {
    const cols = Array.prototype.slice.call(arguments, 2);
    const q = input.value.toLowerCase();
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (row) {
      const cells = row.querySelectorAll("td");
      const match = cols.some(function (ci) {
        return cells[ci] && cells[ci].textContent.toLowerCase().includes(q);
      });
      row.style.display = match ? "" : "none";
    });
  };

  // ── Blacklist helpers ──────────────────────────────────────
  window.removeBlacklist = function (id) {
    const row = document.getElementById("bl-" + id);
    if (row) row.remove();
    showToast("Name removed from blacklist (static demo)", "success");
  };

  window.showAddBlacklist = function () {
    const name = prompt("Enter name to blacklist:");
    if (!name || !name.trim()) return;
    const reason = prompt("Reason:") || "Admin action";
    const tbody = document.getElementById("blacklist-tbody");
    if (!tbody) return;
    const id = "bl-" + Date.now();
    const tr = document.createElement("tr");
    tr.id = id;
    tr.innerHTML = `<td>—</td><td><strong>${name.trim()}</strong></td><td>${reason}</td><td>${new Date().toISOString().slice(0,10)}</td>
      <td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="removeBlacklist('${id}')"><i class="ph ph-trash"></i> Remove</button></td>`;
    tbody.appendChild(tr);
    showToast("\"" + name.trim() + "\" blacklisted (static demo)", "success");
  };

})();
