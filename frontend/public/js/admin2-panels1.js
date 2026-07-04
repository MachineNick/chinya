// ============================================================
// WinzoIndia Admin v2 — Panel Renderers (Part 1)
// Setup + Game Management + User Management
// ============================================================

const PANELS = {};

// ── Overview ────────────────────────────────────────────────
PANELS.overview = () => `
<div class="a2-overview-grid">
  <div class="a2-stat-card"><div class="a2-stat-icon"><i class="ph-fill ph-users"></i></div><div><div class="a2-stat-val">${STATIC.users.length}</div><div class="a2-stat-lbl">Total Users</div></div></div>
  <div class="a2-stat-card"><div class="a2-stat-icon green"><i class="ph-fill ph-currency-inr"></i></div><div><div class="a2-stat-val" style="color:var(--success)">₹${STATIC.deposits.filter(d=>d.status==="success").reduce((a,d)=>a+d.amount,0).toLocaleString("en-IN")}</div><div class="a2-stat-lbl">Total Deposits</div></div></div>
  <div class="a2-stat-card"><div class="a2-stat-icon red"><i class="ph-fill ph-arrow-up-right"></i></div><div><div class="a2-stat-val" style="color:var(--danger)">₹${STATIC.withdrawals.filter(w=>w.status==="approved").reduce((a,w)=>a+w.amount,0).toLocaleString("en-IN")}</div><div class="a2-stat-lbl">Total Withdrawals</div></div></div>
  <div class="a2-stat-card"><div class="a2-stat-icon blue"><i class="ph-fill ph-sword"></i></div><div><div class="a2-stat-val" style="color:#007AFF">${STATIC.challenges.length}</div><div class="a2-stat-lbl">Total Challenges</div></div></div>
  <div class="a2-stat-card"><div class="a2-stat-icon"><i class="ph-fill ph-trophy"></i></div><div><div class="a2-stat-val">${STATIC.tournaments.length}</div><div class="a2-stat-lbl">Tournaments</div></div></div>
  <div class="a2-stat-card"><div class="a2-stat-icon red"><i class="ph-fill ph-warning-octagon"></i></div><div><div class="a2-stat-val" style="color:var(--danger)">${STATIC.users.filter(u=>u.fraud).length}</div><div class="a2-stat-lbl">Fraud Users</div></div></div>
</div>
<div class="a2-panel-head"><h2><i class="ph ph-clock-countdown"></i> Recent Activity</h2></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>Type</th><th>User</th><th>Details</th><th>Time</th><th>Status</th></tr></thead><tbody>
  ${STATIC.deposits.slice(0,3).map(d=>`<tr><td><span class="badge badge-green">Deposit</span></td><td>${d.user}</td><td>${rupee(d.amount)} via ${d.method}</td><td>${d.time}</td><td>${statusBadge(d.status)}</td></tr>`).join("")}
  ${STATIC.withdrawals.slice(0,2).map(w=>`<tr><td><span class="badge badge-red">Withdraw</span></td><td>${w.user}</td><td>${rupee(w.amount)} via ${w.method}</td><td>${w.time}</td><td>${statusBadge(w.status)}</td></tr>`).join("")}
</tbody></table></div>`;

// ── Setup: Deposit Transaction Report ───────────────────────
PANELS["deposit-report"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-receipt"></i> Deposit Transaction Report</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search user or transaction ID..." oninput="filterTable(this,'deposit-report-tbody',0,2)" />
  <select onchange="filterTable(this,'deposit-report-tbody',4)">
    <option value="">All Status</option><option>success</option><option>pending</option><option>failed</option>
  </select>
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="deposit-report-tbody">
${STATIC.deposits.map((d,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${d.id.toUpperCase()}</td><td>${d.user}</td><td style="color:var(--success);font-weight:600">${rupee(d.amount)}</td><td>${d.method}</td><td>${statusBadge(d.status)}</td><td>${d.time}</td></tr>`).join("")}
</tbody></table></div>`;

// ── Setup: All Tournaments ───────────────────────────────────
PANELS["all-tournaments"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-trophy"></i> All Tournaments</h2></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Game</th><th>Entry</th><th>Prize Pool</th><th>Players</th><th>Status</th><th>Start</th></tr></thead><tbody>
${STATIC.tournaments.map((t,i)=>`<tr><td>${i+1}</td><td><strong>${t.name}</strong></td><td>${t.game}</td><td>${rupee(t.entry)}</td><td style="color:var(--accent);font-weight:700">${rupee(t.prize)}</td><td>${t.players}</td><td>${statusBadge(t.status)}</td><td>${t.start}</td></tr>`).join("")}
</tbody></table></div>`;

// ── Setup: Running Tournaments ───────────────────────────────
PANELS["running-tournaments"] = () => {
  const running = STATIC.tournaments.filter(t=>t.status==="running");
  return `<div class="a2-panel-head"><h2><i class="ph ph-play-circle"></i> Running Tournaments</h2><span class="badge badge-blue">${running.length} Live</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Game</th><th>Entry</th><th>Prize Pool</th><th>Players</th><th>Start</th><th>Action</th></tr></thead><tbody>
${running.length ? running.map((t,i)=>`<tr><td>${i+1}</td><td><strong>${t.name}</strong></td><td>${t.game}</td><td>${rupee(t.entry)}</td><td style="color:var(--accent);font-weight:700">${rupee(t.prize)}</td><td>${t.players}</td><td>${t.start}</td><td><button class="btn btn-secondary" style="padding:6px 12px;font-size:11px;"><i class="ph ph-stop-circle"></i> Stop</button></td></tr>`).join("") : emptyRow(8,"No running tournaments.")}
</tbody></table></div>`;
};

// ── Setup: Challenges ────────────────────────────────────────
PANELS["challenges-setup"] = () => PANELS["all-challenges"]();

// ── Setup: Blacklisted Names ─────────────────────────────────
PANELS["blacklisted"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-prohibit"></i> Blacklisted Names</h2>
  <button class="btn btn-primary" style="padding:8px 16px;font-size:12px;" onclick="showAddBlacklist()"><i class="ph ph-plus"></i> Add Name</button>
</div>
<div id="blacklist-msg"></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Reason</th><th>Added</th><th>Action</th></tr></thead><tbody id="blacklist-tbody">
${STATIC.blacklisted.map((b,i)=>`<tr id="bl-${b.id}"><td>${i+1}</td><td><strong>${b.name}</strong></td><td>${b.reason}</td><td>${b.added}</td><td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="removeBlacklist('${b.id}')"><i class="ph ph-trash"></i> Remove</button></td></tr>`).join("")}
</tbody></table></div>`;

// ── Game Management ──────────────────────────────────────────
PANELS["view-all-games"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-list-bullets"></i> All Games</h2></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Type</th><th>Entry Fee</th><th>Prize</th><th>Max Players</th><th>Status</th><th>Created</th></tr></thead><tbody>
${STATIC.games.map((g,i)=>`<tr><td>${i+1}</td><td><strong>${g.name}</strong></td><td><span class="badge ${g.type==="tournament"?"badge-blue":"badge-yellow"}">${g.type}</span></td><td>${rupee(g.entry)}</td><td style="color:var(--accent);font-weight:700">${rupee(g.prize)}</td><td>${g.players}</td><td>${statusBadge(g.status)}</td><td>${g.created}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["add-game"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-plus-circle"></i> Add New Game</h2></div>
<div class="a2-form-card">
  <div class="form">
    <div class="a2-form-grid">
      <div class="field"><label>Game Name</label><input type="text" placeholder="e.g. Ludo Classic" /></div>
      <div class="field"><label>Game Type</label><select><option>regular</option><option>tournament</option></select></div>
      <div class="field"><label>Entry Fee (₹)</label><input type="number" placeholder="50" /></div>
      <div class="field"><label>Prize Amount (₹)</label><input type="number" placeholder="90" /></div>
      <div class="field"><label>Max Players</label><input type="number" placeholder="2" /></div>
      <div class="field"><label>Status</label><select><option>active</option><option>inactive</option></select></div>
    </div>
    <div class="field"><label>Description</label><textarea rows="3" placeholder="Game rules and description..."></textarea></div>
    <button class="btn btn-primary" onclick="showToast('Game added successfully! (static demo)','success')"><i class="ph-fill ph-plus-circle"></i> Add Game</button>
  </div>
</div>`;

PANELS["view-tournament-games"] = () => {
  const tg = STATIC.games.filter(g=>g.type==="tournament");
  return `<div class="a2-panel-head"><h2><i class="ph ph-list-star"></i> Tournament Games</h2></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Entry Fee</th><th>Prize Pool</th><th>Max Players</th><th>Status</th></tr></thead><tbody>
${tg.map((g,i)=>`<tr><td>${i+1}</td><td><strong>${g.name}</strong></td><td>${rupee(g.entry)}</td><td style="color:var(--accent);font-weight:700">${rupee(g.prize)}</td><td>${g.players}</td><td>${statusBadge(g.status)}</td></tr>`).join("")}
</tbody></table></div>`;
};

PANELS["add-tournament-game"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-plus-square"></i> Add Tournament Game</h2></div>
<div class="a2-form-card">
  <div class="form">
    <div class="a2-form-grid">
      <div class="field"><label>Tournament Name</label><input type="text" placeholder="e.g. Ludo Grand Prix" /></div>
      <div class="field"><label>Base Game</label><select><option>Ludo Classic</option><option>Snake & Ladder</option><option>Ludo Blitz</option></select></div>
      <div class="field"><label>Entry Fee (₹)</label><input type="number" placeholder="100" /></div>
      <div class="field"><label>Prize Pool (₹)</label><input type="number" placeholder="5000" /></div>
      <div class="field"><label>Max Players</label><input type="number" placeholder="64" /></div>
      <div class="field"><label>Start Date & Time</label><input type="datetime-local" /></div>
    </div>
    <button class="btn btn-primary" onclick="showToast('Tournament game added! (static demo)','success')"><i class="ph-fill ph-trophy"></i> Create Tournament</button>
  </div>
</div>`;

// ── User Management ──────────────────────────────────────────
PANELS["view-all-users"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-user-list"></i> All Users</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search name, phone or email..." oninput="filterTable(this,'all-users-tbody',0,1,2,3)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>KYC</th><th>Chips</th><th>Wallet</th><th>Status</th><th>Joined</th></tr></thead>
<tbody id="all-users-tbody">
${STATIC.users.map((u,i)=>`<tr><td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.phone}</td><td>${u.email}</td><td>${statusBadge(u.kycStatus)}</td><td style="color:var(--accent);font-weight:700">${u.chips.toLocaleString("en-IN")}</td><td>${rupee(u.wallet)}</td><td>${statusBadge(u.status)}</td><td>${u.joined}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["add-user"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-user-plus"></i> Add New User</h2></div>
<div class="a2-form-card">
  <div class="form">
    <div class="a2-form-grid">
      <div class="field"><label>Full Name</label><input type="text" placeholder="Full name" /></div>
      <div class="field"><label>Phone</label><input type="tel" placeholder="10-digit mobile" /></div>
      <div class="field"><label>Email</label><input type="email" placeholder="user@example.com" /></div>
      <div class="field"><label>Password</label><input type="password" placeholder="Min 8 chars" /></div>
      <div class="field"><label>KYC Type</label><select><option>Aadhaar</option><option>PAN</option><option>DL</option><option>Passport</option></select></div>
      <div class="field"><label>Initial Chips</label><input type="number" placeholder="0" /></div>
    </div>
    <button class="btn btn-primary" onclick="showToast('User added! (static demo)','success')"><i class="ph-fill ph-user-plus"></i> Create User</button>
  </div>
</div>`;

PANELS["review-kyc"] = () => {
  const pending = STATIC.users.filter(u=>u.kycStatus==="pending"||u.kycStatus==="rejected");
  return `<div class="a2-panel-head"><h2><i class="ph ph-identification-card"></i> Review KYC Users</h2><span class="badge badge-yellow">${pending.length} Pending</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>KYC Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>
${pending.length ? pending.map((u,i)=>`<tr><td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.phone}</td><td>${u.kyc}</td><td>${statusBadge(u.kycStatus)}</td>
<td style="display:flex;gap:8px;">
  <button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="showToast('KYC Approved for ${u.name}','success')"><i class="ph ph-check"></i> Approve</button>
  <button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="showToast('KYC Rejected for ${u.name}','error')"><i class="ph ph-x"></i> Reject</button>
</td></tr>`).join("") : emptyRow(6,"All KYC submissions reviewed.")}
</tbody></table></div>`;
};

PANELS["fraud-users"] = () => {
  const fraud = STATIC.users.filter(u=>u.fraud);
  return `<div class="a2-panel-head"><h2><i class="ph ph-warning-octagon"></i> Fraud Users</h2><span class="badge badge-red">${fraud.length} Flagged</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Chips</th><th>Status</th><th>Action</th></tr></thead><tbody>
${fraud.length ? fraud.map((u,i)=>`<tr><td>${i+1}</td><td><strong style="color:var(--danger)">${u.name}</strong></td><td>${u.phone}</td><td>${u.email}</td><td>${u.chips}</td><td>${statusBadge(u.status)}</td>
<td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="showToast('User banned (static demo)','error')"><i class="ph ph-prohibit"></i> Ban</button></td></tr>`).join("") : emptyRow(7,"No fraud users flagged.")}
</tbody></table></div>`;
};

PANELS["wallet-mismatch"] = () => {
  const mm = STATIC.users.filter(u=>u.walletMismatch);
  return `<div class="a2-panel-head"><h2><i class="ph ph-scales"></i> Wallet Mismatch Users</h2><span class="badge badge-red">${mm.length} Mismatch</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Chips (Game)</th><th>Wallet (DB)</th><th>Difference</th><th>Action</th></tr></thead><tbody>
${mm.length ? mm.map((u,i)=>`<tr><td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.phone}</td><td style="color:var(--accent)">${u.chips.toLocaleString("en-IN")}</td><td style="color:var(--success)">${rupee(u.wallet)}</td><td style="color:var(--danger);font-weight:700">₹${Math.abs(u.chips-u.wallet).toLocaleString("en-IN")}</td>
<td><button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Wallet synced (static demo)','success')"><i class="ph ph-arrows-clockwise"></i> Sync</button></td></tr>`).join("") : emptyRow(7,"No wallet mismatches found.")}
</tbody></table></div>`;
};
