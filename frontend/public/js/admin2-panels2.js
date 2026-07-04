// ============================================================
// WinzoIndia Admin v2 — Panel Renderers (Part 2)
// Challenge (sets) + Reports + Transaction Management
// All data read LIVE from localStorage
// ============================================================

// ── Challenge Management (uses winzo_sets_global) ─────────────
PANELS["challenges-24h"] = function() {
  const sets = getLiveSets();
  return `<div class="a2-panel-head"><h2><i class="ph ph-clock-countdown"></i> Last 24h Challenges</h2><span class="badge badge-blue">${sets.length} Total</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player</th><th>Game</th><th>Value</th><th>Status</th><th>Accepted By</th><th>Time</th></tr></thead><tbody>
${sets.length ? sets.slice().reverse().map(function(s,i){return `<tr><td>${i+1}</td><td><strong>${s.byName||"—"}</strong></td><td>${s.gameType||"—"}</td><td style="color:var(--accent);font-weight:700">₹${Number(s.value||0).toLocaleString("en-IN")}</td><td>${statusBadge(s.acceptedBy?"matched":"open")}</td><td>${s.acceptedByName||"—"}</td><td>${s.createdAt||"—"}</td></tr>`;}).join("") : emptyRow(7,"No challenges in last 24h.")}
</tbody></table></div>`;
};

PANELS["running-challenges"] = function() {
  const sets = getLiveSets().filter(function(s){return !s.acceptedBy;});
  return `<div class="a2-panel-head"><h2><i class="ph ph-spinner-gap"></i> Running Challenges</h2><span class="badge badge-blue">${sets.length} Open</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player</th><th>Game</th><th>Value</th><th>Time</th><th>Action</th></tr></thead><tbody>
${sets.length ? sets.map(function(s,i){return `<tr><td>${i+1}</td><td><strong>${s.byName||"—"}</strong></td><td>${s.gameType||"—"}</td><td style="color:var(--accent);font-weight:700">₹${Number(s.value||0).toLocaleString("en-IN")}</td><td>${s.createdAt||"—"}</td>
<td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="adminDeleteSet('${s.id}')"><i class="ph ph-x-circle"></i> Cancel</button></td></tr>`;}).join("") : emptyRow(6,"No open challenges.")}
</tbody></table></div>`;
};

PANELS["search-challenges"] = function() {
  const sets = getLiveSets();
  return `<div class="a2-panel-head"><h2><i class="ph ph-magnifying-glass"></i> Search Challenges</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search by player name or game..." oninput="filterTable(this,'search-ch-tbody',1,2)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player</th><th>Game</th><th>Value</th><th>Status</th><th>Accepted By</th></tr></thead>
<tbody id="search-ch-tbody">
${sets.length ? sets.slice().reverse().map(function(s,i){return `<tr><td>${i+1}</td><td><strong>${s.byName||"—"}</strong></td><td>${s.gameType||"—"}</td><td style="color:var(--accent);font-weight:700">₹${Number(s.value||0).toLocaleString("en-IN")}</td><td>${statusBadge(s.acceptedBy?"matched":"open")}</td><td>${s.acceptedByName||"—"}</td></tr>`;}).join("") : emptyRow(6,"No challenges found.")}
</tbody></table></div>`;
};

PANELS["search-screenshots"] = function() {
  const results = (function(){ try { return JSON.parse(localStorage.getItem("winzo_results") || "[]"); } catch(e){ return []; } })();
  const reports = getLiveReports();
  const all = results.concat(reports.map(function(r){ return { _type:"report", submitterName:r.reporterName, submitterPhone:"—", opponentName:r.opponent, opponentPhone:"—", gameType:"—", amount:"—", result:"report", proofUrl:r.proofUrl, status:r.status, at:r.at||"—" }; }));
  return `<div class="a2-panel-head"><h2><i class="ph ph-image-square"></i> Search Screenshots</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search by player or opponent..." oninput="filterTable(this,'ss-tbody',1,3)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Game ID</th><th>Player</th><th>Phone</th><th>Opponent</th><th>Opp. Phone</th><th>Game</th><th>Amount</th><th>Result</th><th>Screenshot</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="ss-tbody">
${all.length ? all.map(function(r,i){ return `<tr>
  <td>${i+1}</td>
  <td style="font-family:monospace;font-size:12px;color:var(--accent);">${r.gameId||"—"}</td>
  <td><strong>${r.submitterName||"—"}</strong></td>
  <td>${r.submitterPhone||"—"}</td>
  <td>${r.opponentName||"—"}</td>
  <td>${r.opponentPhone||"—"}</td>
  <td>${r.gameType||"—"}</td>
  <td>${r.amount && r.amount!=="—" ? rupee(r.amount) : "—"}</td>
  <td>${statusBadge(r.result||"pending")}</td>
  <td>${r.proofUrl ? `<a href="${r.proofUrl}" target="_blank"><img src="${r.proofUrl}" style="width:48px;height:36px;object-fit:cover;border-radius:4px;cursor:pointer;" /></a>` : "—"}</td>
  <td>${statusBadge(r.status||"pending")}</td>
  <td style="font-size:11px;color:var(--text-muted);">${r.at||"—"}</td>
</tr>`;}).join("") : emptyRow(12,"No screenshots submitted yet.")}
</tbody></table></div>`;
};

PANELS["all-challenges"] = function() {
  const sets = getLiveSets();
  return `<div class="a2-panel-head"><h2><i class="ph ph-stack"></i> All Challenges</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search player or game..." oninput="filterTable(this,'all-ch-tbody',1,2)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player</th><th>Game</th><th>Value</th><th>Status</th><th>Accepted By</th><th>Action</th></tr></thead>
<tbody id="all-ch-tbody">
${sets.length ? sets.slice().reverse().map(function(s,i){return `<tr><td>${i+1}</td><td><strong>${s.byName||"—"}</strong></td><td>${s.gameType||"—"}</td><td style="color:var(--accent);font-weight:700">₹${Number(s.value||0).toLocaleString("en-IN")}</td><td>${statusBadge(s.acceptedBy?"matched":"open")}</td><td>${s.acceptedByName||"—"}</td>
<td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="adminDeleteSet('${s.id}')"><i class="ph ph-trash"></i> Delete</button></td></tr>`;}).join("") : emptyRow(7,"No challenges yet.")}
</tbody></table></div>`;
};

// ── Transaction Management ────────────────────────────────────
PANELS["new-deposit-requests"] = function() {
  const reqs = getLiveDeposits().filter(function(d){ return d.type === "Deposit Request" && d.status === "pending"; });
  return `<div class="a2-panel-head"><h2><i class="ph ph-bell-ringing"></i> New Deposit Requests</h2><span class="badge badge-yellow">${reqs.length} Pending</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>User</th><th>Phone</th><th>Email</th><th>Amount</th><th>Method</th><th>Txn ID / UTR</th><th>Time</th><th>Action</th></tr></thead><tbody>
${reqs.length ? reqs.map(function(d,i){ return `<tr>
  <td>${i+1}</td>
  <td><strong>${d.user||"—"}</strong></td>
  <td>${d.userPhone||"—"}</td>
  <td>${d.userEmail||"—"}</td>
  <td style="color:var(--accent);font-weight:700">${rupee(d.amount)}</td>
  <td>${d.method||"—"}</td>
  <td style="font-family:monospace;font-size:12px;">${d.txnId||"—"}</td>
  <td>${d.time||"—"}</td>
  <td style="display:flex;gap:6px;">
    <button class="btn btn-primary" style="padding:5px 12px;font-size:12px;" onclick="approveDepositRequest('${d.id}')"><i class="ph ph-check"></i> Approve</button>
    <button class="btn btn-secondary" style="padding:5px 12px;font-size:12px;color:var(--danger);border-color:var(--danger);" onclick="rejectDepositRequest('${d.id}')"><i class="ph ph-x"></i> Reject</button>
  </td>
</tr>`;}).join("") : emptyRow(9,"No pending deposit requests.")}
</tbody></table></div>`;
};

PANELS["deposits-2h"] = function() {
  const deps = getLiveDeposits().slice(-10).reverse();
  return `<div class="a2-panel-head"><h2><i class="ph ph-clock"></i> Last 2h Deposits</h2><span class="badge badge-green">${deps.length} Recent</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead><tbody>
${deps.length ? deps.map(function(d,i){return `<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${(d.id||"—").toUpperCase()}</td><td>${d.user||d.userName||"—"}</td><td style="color:var(--success);font-weight:700">${rupee(d.amount)}</td><td>${d.method||"UPI"}</td><td>${statusBadge(d.status||"pending")}</td><td>${d.time||d.createdAt||"—"}</td></tr>`;}).join("") : emptyRow(7,"No recent deposits.")}
</tbody></table></div>`;
};

PANELS["recent-withdrawals"] = function() {
  const wds = getLiveWithdrawals().filter(function(w){return w.status==="pending";});
  return `<div class="a2-panel-head"><h2><i class="ph ph-arrow-up-right"></i> Recent Withdrawal Requests</h2><span class="badge badge-yellow">${wds.length} Pending</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead><tbody>
${wds.length ? wds.map(function(w,i){return `<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${(w.id||"—").toUpperCase()}</td><td>${w.user||w.userName||"—"}</td><td style="color:var(--danger);font-weight:700">${rupee(w.amount)}</td><td>${w.method||"UPI"}</td><td>${statusBadge(w.status||"pending")}</td>
<td style="display:flex;gap:6px;">
  <button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Approved','success')"><i class="ph ph-check"></i> Approve</button>
  <button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Rejected','error')"><i class="ph ph-x"></i> Reject</button>
</td></tr>`;}).join("") : emptyRow(7,"No pending withdrawal requests.")}
</tbody></table></div>`;
};

PANELS["all-deposits"] = function() {
  const deps = getLiveDeposits();
  return `<div class="a2-panel-head"><h2><i class="ph ph-arrow-down-left"></i> All Deposits</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search user..." oninput="filterTable(this,'all-dep-tbody',2)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="all-dep-tbody">
${deps.length ? deps.slice().reverse().map(function(d,i){return `<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${(d.id||"—").toUpperCase()}</td><td>${d.user||d.userName||"—"}</td><td style="color:var(--success);font-weight:700">${rupee(d.amount)}</td><td>${d.method||"UPI"}</td><td>${statusBadge(d.status||"pending")}</td><td>${d.time||d.createdAt||"—"}</td></tr>`;}).join("") : emptyRow(7,"No deposits yet.")}
</tbody></table></div>`;
};

PANELS["all-withdrawals"] = function() {
  const wds = getLiveWithdrawals();
  return `<div class="a2-panel-head"><h2><i class="ph ph-list-checks"></i> All Withdraw Requests</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search user..." oninput="filterTable(this,'all-wd-tbody',2)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="all-wd-tbody">
${wds.length ? wds.slice().reverse().map(function(w,i){return `<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${(w.id||"—").toUpperCase()}</td><td>${w.user||w.userName||"—"}</td><td style="color:var(--danger);font-weight:700">${rupee(w.amount)}</td><td>${w.method||"UPI"}</td><td>${statusBadge(w.status||"pending")}</td><td>${w.time||w.createdAt||"—"}</td></tr>`;}).join("") : emptyRow(7,"No withdrawal requests yet.")}
</tbody></table></div>`;
};

PANELS["manual-deposit"] = function() {
  const users = getLiveUsers();
  return `<div class="a2-panel-head"><h2><i class="ph ph-plus"></i> Manual Deposit by Admin</h2></div>
<div class="a2-tx-card"><h3><i class="ph-fill ph-arrow-down-left"></i> Add Funds to User Wallet</h3>
<div class="form">
  <div class="field"><label>Select User</label>
    <select id="md-user"><option value="">-- Select User --</option>${users.map(function(u){return `<option value="${u.uid}">${u.fullName||u.name} (${u.phone})</option>`;}).join("")}</select>
  </div>
  <div class="field"><label>Amount (₹)</label><input id="md-amount" type="number" placeholder="Enter amount" min="1" /></div>
  <div class="field"><label>Reason / Note</label><input id="md-note" type="text" placeholder="e.g. Bonus, Refund, Correction" /></div>
  <button class="btn btn-primary" onclick="adminManualDeposit()"><i class="ph-fill ph-plus-circle"></i> Add Deposit</button>
</div></div>`;
};

PANELS["manual-withdraw-haoda"] = function() {
  const users = getLiveUsers();
  return `<div class="a2-panel-head"><h2><i class="ph ph-hand-withdraw"></i> Manual Withdraw by Haoda</h2></div>
<div class="a2-tx-card"><h3><i class="ph-fill ph-arrow-up-right"></i> Process Haoda Withdrawal</h3>
<div class="form">
  <div class="field"><label>Select User</label>
    <select><option value="">-- Select User --</option>${users.map(function(u){return `<option value="${u.uid}">${u.fullName||u.name} (${u.phone})</option>`;}).join("")}</select>
  </div>
  <div class="field"><label>Amount (₹)</label><input type="number" placeholder="Enter amount" min="1" /></div>
  <div class="field"><label>Haoda Transaction ID</label><input type="text" placeholder="Haoda Txn ID" /></div>
  <div class="field"><label>Note</label><input type="text" placeholder="Reason" /></div>
  <button class="btn btn-primary" onclick="showToast('Haoda withdrawal processed','success')"><i class="ph-fill ph-hand-withdraw"></i> Process</button>
</div></div>`;
};

PANELS["manual-withdraw-admin"] = function() {
  const users = getLiveUsers();
  return `<div class="a2-panel-head"><h2><i class="ph ph-hand-coins"></i> Manual Withdraw by Admin</h2></div>
<div class="a2-tx-card"><h3><i class="ph-fill ph-hand-coins"></i> Admin Forced Withdrawal</h3>
<div class="form">
  <div class="field"><label>Select User</label>
    <select id="mwa-user"><option value="">-- Select User --</option>${users.map(function(u){return `<option value="${u.uid}">${u.fullName||u.name} (${u.phone})</option>`;}).join("")}</select>
  </div>
  <div class="field"><label>Amount (₹)</label><input id="mwa-amount" type="number" placeholder="Enter amount" min="1" /></div>
  <div class="field"><label>Payment Method</label><select><option>UPI</option><option>Bank Transfer</option><option>Cash</option></select></div>
  <div class="field"><label>UPI ID / Account No.</label><input type="text" placeholder="UPI or bank details" /></div>
  <div class="field"><label>Admin Note</label><input type="text" placeholder="Reason" /></div>
  <button class="btn btn-primary" onclick="adminManualWithdraw()"><i class="ph-fill ph-hand-coins"></i> Process Withdrawal</button>
</div></div>`;
};
