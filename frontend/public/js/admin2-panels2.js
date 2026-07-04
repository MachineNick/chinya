// ============================================================
// WinzoIndia Admin v2 — Panel Renderers (Part 2)
// Challenge Management + Transaction Management
// ============================================================

// ── Challenge Management ─────────────────────────────────────
PANELS["challenges-24h"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-clock-countdown"></i> Last 24h Challenges</h2><span class="badge badge-blue">${STATIC.challenges.length} Total</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player 1</th><th>Player 2</th><th>Game</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead><tbody>
${STATIC.challenges.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.player1}</strong></td><td>${c.player2}</td><td>${c.game}</td><td style="color:var(--accent);font-weight:700">${rupee(c.amount)}</td><td>${statusBadge(c.status)}</td><td>${c.time}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["running-challenges"] = () => {
  const rc = STATIC.challenges.filter(c=>c.status==="running");
  return `<div class="a2-panel-head"><h2><i class="ph ph-spinner-gap"></i> Running Challenges</h2><span class="badge badge-blue">${rc.length} Live</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player 1</th><th>Player 2</th><th>Game</th><th>Amount</th><th>Time</th><th>Action</th></tr></thead><tbody>
${rc.length ? rc.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.player1}</strong></td><td>${c.player2}</td><td>${c.game}</td><td style="color:var(--accent);font-weight:700">${rupee(c.amount)}</td><td>${c.time}</td>
<td><button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Challenge cancelled (static demo)','error')"><i class="ph ph-x-circle"></i> Cancel</button></td></tr>`).join("") : emptyRow(7,"No running challenges.")}
</tbody></table></div>`;
};

PANELS["search-challenges"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-magnifying-glass"></i> Search Challenges</h2></div>
<div class="a2-search">
  <input type="text" id="challenge-search" placeholder="Search by player name or game..." oninput="filterTable(this,'search-ch-tbody',0,1,2,3)" />
  <select onchange="filterTable(this,'search-ch-tbody',5)">
    <option value="">All Status</option><option>running</option><option>completed</option><option>disputed</option>
  </select>
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player 1</th><th>Player 2</th><th>Game</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="search-ch-tbody">
${STATIC.challenges.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.player1}</strong></td><td>${c.player2}</td><td>${c.game}</td><td style="color:var(--accent);font-weight:700">${rupee(c.amount)}</td><td>${statusBadge(c.status)}</td><td>${c.time}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["search-screenshots"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-image-square"></i> Search Screenshots</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search by player name or challenge ID..." />
  <button class="btn btn-primary" style="padding:10px 20px;font-size:13px;" onclick="showToast('Screenshot search coming with Firebase storage','info')"><i class="ph ph-magnifying-glass"></i> Search</button>
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Challenge ID</th><th>Player 1</th><th>Player 2</th><th>Game</th><th>Screenshot</th><th>Status</th></tr></thead><tbody>
${STATIC.challenges.map((c,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${c.id.toUpperCase()}</td><td>${c.player1}</td><td>${c.player2}</td><td>${c.game}</td>
<td>${c.screenshot ? `<a href="${c.screenshot}" target="_blank" class="btn btn-secondary" style="padding:4px 10px;font-size:11px;"><i class="ph ph-image"></i> View</a>` : '<span style="color:var(--text-muted);font-size:12px;">Not uploaded</span>'}</td>
<td>${statusBadge(c.status)}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["all-challenges"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-stack"></i> All Challenges</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search player or game..." oninput="filterTable(this,'all-ch-tbody',0,1,2,3)" />
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Player 1</th><th>Player 2</th><th>Game</th><th>Amount</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
<tbody id="all-ch-tbody">
${STATIC.challenges.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.player1}</strong></td><td>${c.player2}</td><td>${c.game}</td><td style="color:var(--accent);font-weight:700">${rupee(c.amount)}</td><td>${statusBadge(c.status)}</td><td>${c.time}</td>
<td>${c.status==="disputed"?`<button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Dispute resolved (static demo)','success')"><i class="ph ph-check"></i> Resolve</button>`:"—"}</td></tr>`).join("")}
</tbody></table></div>`;

// ── Transaction Management ───────────────────────────────────
PANELS["deposits-2h"] = () => {
  const recent = STATIC.deposits.slice(0,3);
  return `<div class="a2-panel-head"><h2><i class="ph ph-clock"></i> Last 2h Deposits</h2><span class="badge badge-green">${recent.length} Deposits</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead><tbody>
${recent.map((d,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${d.id.toUpperCase()}</td><td>${d.user}</td><td style="color:var(--success);font-weight:700">${rupee(d.amount)}</td><td>${d.method}</td><td>${statusBadge(d.status)}</td><td>${d.time}</td></tr>`).join("")}
</tbody></table></div>`;
};

PANELS["recent-withdrawals"] = () => {
  const recent = STATIC.withdrawals.filter(w=>w.status==="pending");
  return `<div class="a2-panel-head"><h2><i class="ph ph-arrow-up-right"></i> Recent Withdrawal Requests</h2><span class="badge badge-yellow">${recent.length} Pending</span></div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>UPI/Bank</th><th>Status</th><th>Actions</th></tr></thead><tbody>
${recent.length ? recent.map((w,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${w.id.toUpperCase()}</td><td>${w.user}</td><td style="color:var(--danger);font-weight:700">${rupee(w.amount)}</td><td>${w.method}</td><td>${w.upi}</td><td>${statusBadge(w.status)}</td>
<td style="display:flex;gap:6px;">
  <button class="btn btn-primary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Withdrawal approved (static demo)','success')"><i class="ph ph-check"></i> Approve</button>
  <button class="btn btn-secondary" style="padding:5px 10px;font-size:11px;" onclick="showToast('Withdrawal rejected (static demo)','error')"><i class="ph ph-x"></i> Reject</button>
</td></tr>`).join("") : emptyRow(8,"No pending withdrawal requests.")}
</tbody></table></div>`;
};

PANELS["all-deposits"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-arrow-down-left"></i> All Deposits</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search user..." oninput="filterTable(this,'all-dep-tbody',0,2)" />
  <select onchange="filterTable(this,'all-dep-tbody',5)">
    <option value="">All Status</option><option>success</option><option>pending</option><option>failed</option>
  </select>
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="all-dep-tbody">
${STATIC.deposits.map((d,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${d.id.toUpperCase()}</td><td>${d.user}</td><td style="color:var(--success);font-weight:700">${rupee(d.amount)}</td><td>${d.method}</td><td>${statusBadge(d.status)}</td><td>${d.time}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["all-withdrawals"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-list-checks"></i> All Withdraw Requests</h2></div>
<div class="a2-search">
  <input type="text" placeholder="Search user..." oninput="filterTable(this,'all-wd-tbody',0,2)" />
  <select onchange="filterTable(this,'all-wd-tbody',6)">
    <option value="">All Status</option><option>pending</option><option>approved</option><option>rejected</option>
  </select>
</div>
<div class="a2-table-wrap"><table class="a2-table"><thead><tr><th>#</th><th>Txn ID</th><th>User</th><th>Amount</th><th>Method</th><th>UPI/Bank</th><th>Status</th><th>Time</th></tr></thead>
<tbody id="all-wd-tbody">
${STATIC.withdrawals.map((w,i)=>`<tr><td>${i+1}</td><td style="font-family:var(--font-head);font-size:11px;color:var(--text-muted)">${w.id.toUpperCase()}</td><td>${w.user}</td><td style="color:var(--danger);font-weight:700">${rupee(w.amount)}</td><td>${w.method}</td><td>${w.upi}</td><td>${statusBadge(w.status)}</td><td>${w.time}</td></tr>`).join("")}
</tbody></table></div>`;

PANELS["manual-deposit"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-plus"></i> Manual Deposit by Admin</h2></div>
<div class="a2-tx-card">
  <h3><i class="ph-fill ph-arrow-down-left"></i> Add Funds to User Wallet</h3>
  <div class="form">
    <div class="field"><label>Select User</label>
      <select><option value="">-- Select User --</option>${STATIC.users.map(u=>`<option value="${u.uid}">${u.name} (${u.phone})</option>`).join("")}</select>
    </div>
    <div class="field"><label>Amount (₹)</label><input type="number" placeholder="Enter amount" min="1" /></div>
    <div class="field"><label>Reason / Note</label><input type="text" placeholder="e.g. Bonus, Refund, Correction" /></div>
    <button class="btn btn-primary" onclick="showToast('Manual deposit added (static demo)','success')"><i class="ph-fill ph-plus-circle"></i> Add Deposit</button>
  </div>
</div>`;

PANELS["manual-withdraw-haoda"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-hand-withdraw"></i> Manual Withdraw by Haoda</h2></div>
<div class="a2-tx-card">
  <h3><i class="ph-fill ph-arrow-up-right"></i> Process Haoda Withdrawal</h3>
  <div class="form">
    <div class="field"><label>Select User</label>
      <select><option value="">-- Select User --</option>${STATIC.users.map(u=>`<option value="${u.uid}">${u.name} (${u.phone})</option>`).join("")}</select>
    </div>
    <div class="field"><label>Amount (₹)</label><input type="number" placeholder="Enter amount" min="1" /></div>
    <div class="field"><label>Haoda Transaction ID</label><input type="text" placeholder="Haoda Txn ID" /></div>
    <div class="field"><label>Note</label><input type="text" placeholder="Reason for manual withdrawal" /></div>
    <button class="btn btn-primary" onclick="showToast('Haoda withdrawal processed (static demo)','success')"><i class="ph-fill ph-hand-withdraw"></i> Process Withdrawal</button>
  </div>
</div>`;

PANELS["manual-withdraw-admin"] = () => `
<div class="a2-panel-head"><h2><i class="ph ph-hand-coins"></i> Manual Withdraw by Admin</h2></div>
<div class="a2-tx-card">
  <h3><i class="ph-fill ph-hand-coins"></i> Admin Forced Withdrawal</h3>
  <div class="form">
    <div class="field"><label>Select User</label>
      <select><option value="">-- Select User --</option>${STATIC.users.map(u=>`<option value="${u.uid}">${u.name} (${u.phone})</option>`).join("")}</select>
    </div>
    <div class="field"><label>Amount (₹)</label><input type="number" placeholder="Enter amount" min="1" /></div>
    <div class="field"><label>Payment Method</label><select><option>UPI</option><option>Bank Transfer</option><option>Cash</option></select></div>
    <div class="field"><label>UPI ID / Account No.</label><input type="text" placeholder="UPI or bank details" /></div>
    <div class="field"><label>Admin Note</label><input type="text" placeholder="Reason for forced withdrawal" /></div>
    <button class="btn btn-primary" onclick="showToast('Admin withdrawal processed (static demo)','success')"><i class="ph-fill ph-hand-coins"></i> Process Withdrawal</button>
  </div>
</div>`;
