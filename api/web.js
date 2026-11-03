// api/web.js — Serves the admin dashboard HTML (with login page)

import { checkAdminAuth, validateLogin, createSessionCookie } from './_auth.js';

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đăng Nhập - VDS License Manager</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --primary:#4f46e5; --bg:#0f172a; --card-bg:#1e293b; --text:#f8fafc; --sub:#94a3b8; --border:#334155; --danger:#ef4444; }
  * { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',sans-serif; }
  body { background:var(--bg); color:var(--text); min-height:100vh; display:flex; align-items:center; justify-content:center; }
  .card { background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:40px; width:100%; max-width:420px; }
  h1 { font-size:22px; font-weight:700; text-align:center; margin-bottom:8px; }
  .sub { color:var(--sub); font-size:13px; text-align:center; margin-bottom:30px; }
  .form-group { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
  label { font-size:13px; font-weight:500; color:var(--sub); }
  input { background:#0f172a; border:1px solid var(--border); color:#fff; padding:11px 14px; border-radius:8px; font-size:14px; outline:none; width:100%; }
  input:focus { border-color:var(--primary); }
  .btn { background:var(--primary); color:#fff; border:none; padding:13px; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; width:100%; margin-top:8px; }
  .btn:hover { background:#4338ca; }
  .error { background:rgba(239,68,68,0.12); border:1px solid var(--danger); color:var(--danger); padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; display:none; }
  .error.show { display:block; }
</style>
</head>
<body>
<div class="card">
  <h1>🔑 VDS License Manager</h1>
  <p class="sub">Quản lý kích hoạt bản quyền iOS Tweak</p>
  <div class="error" id="errMsg"></div>
  <form id="loginForm">
    <div class="form-group">
      <label>Tên đăng nhập</label>
      <input type="text" id="username" placeholder="hson" autocomplete="username" required>
    </div>
    <div class="form-group">
      <label>Mật khẩu</label>
      <input type="password" id="password" placeholder="••••••••" autocomplete="current-password" required>
    </div>
    <button type="submit" class="btn">Đăng Nhập →</button>
  </form>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Đang xử lý...';
  btn.disabled = true;
  const res = await fetch('/api/web?path=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    })
  });
  const data = await res.json();
  if (data.success) {
    window.location.href = '/';
  } else {
    const err = document.getElementById('errMsg');
    err.textContent = data.message || 'Sai tên đăng nhập hoặc mật khẩu!';
    err.classList.add('show');
    btn.textContent = 'Đăng Nhập →';
    btn.disabled = false;
  }
});
</script>
</body>
</html>`;

const DASHBOARD_PAGE = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VDS License Manager - Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --primary:#4f46e5; --primary-hover:#4338ca; --bg:#0f172a; --card-bg:#1e293b; --text-main:#f8fafc; --text-sub:#94a3b8; --border:#334155; --success:#10b981; --danger:#ef4444; --warning:#f59e0b; }
  * { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',sans-serif; }
  body { background:var(--bg); color:var(--text-main); padding:30px 20px; }
  .container { max-width:1100px; margin:0 auto; }
  header { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid var(--border); }
  header h1 { font-size:24px; font-weight:700; }
  header p { color:var(--text-sub); font-size:13px; margin-top:4px; }
  .header-actions { display:flex; gap:10px; align-items:center; }
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-bottom:30px; }
  .stat-card { background:var(--card-bg); padding:20px; border-radius:12px; border:1px solid var(--border); }
  .stat-card .label { color:var(--text-sub); font-size:13px; }
  .stat-card .value { font-size:26px; font-weight:700; margin-top:8px; }
  .card { background:var(--card-bg); border-radius:12px; border:1px solid var(--border); padding:25px; margin-bottom:30px; }
  .card-title { font-size:17px; font-weight:600; margin-bottom:20px; }
  .form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:15px; align-items:end; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  label { font-size:13px; font-weight:500; color:var(--text-sub); }
  input, select { background:#0f172a; border:1px solid var(--border); color:#fff; padding:10px 14px; border-radius:8px; font-size:14px; outline:none; }
  input:focus, select:focus { border-color:var(--primary); }
  .btn { background:var(--primary); color:#fff; border:none; padding:11px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
  .btn:hover { background:var(--primary-hover); }
  .btn-outline { background:transparent; border:1px solid var(--border); color:var(--text-main); }
  .btn-outline:hover { border-color:#fff; }
  .btn-danger { background:var(--danger); }
  .btn-danger:hover { background:#dc2626; }
  .table-responsive { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th { background:#172033; color:var(--text-sub); font-weight:600; padding:12px 14px; border-bottom:1px solid var(--border); text-align:left; }
  td { padding:12px 14px; border-bottom:1px solid var(--border); vertical-align:middle; }
  tr:hover { background:rgba(255,255,255,0.02); }
  .key-badge { font-family:monospace; font-size:13px; font-weight:700; background:rgba(79,70,229,0.15); color:#818cf8; padding:4px 8px; border-radius:6px; }
  .badge { font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px; }
  .badge-active { background:rgba(16,185,129,0.15); color:var(--success); }
  .badge-expired { background:rgba(239,68,68,0.15); color:var(--danger); }
  .badge-locked { background:rgba(245,158,11,0.15); color:var(--warning); }
  .device-id { font-family:monospace; font-size:12px; color:var(--text-sub); }
  .action-btn { background:transparent; border:1px solid var(--border); color:#fff; padding:5px 9px; border-radius:6px; font-size:12px; cursor:pointer; margin-right:4px; }
  .action-btn:hover { border-color:#fff; }
  .action-btn.del:hover { background:var(--danger); border-color:var(--danger); }
  .toast { position:fixed; bottom:24px; right:24px; background:#1e293b; border:1px solid var(--border); color:#fff; padding:12px 20px; border-radius:10px; font-size:14px; box-shadow:0 4px 20px rgba(0,0,0,0.4); opacity:0; transition:opacity 0.3s; pointer-events:none; z-index:999; }
  .toast.show { opacity:1; }
  .search-box { padding:9px 14px; background:#0f172a; border:1px solid var(--border); border-radius:8px; color:#fff; font-size:14px; outline:none; width:220px; }
  .copy-btn { background:none; border:none; color:var(--text-sub); cursor:pointer; padding:2px 6px; font-size:12px; }
  .copy-btn:hover { color:#fff; }
  .empty-state { text-align:center; color:var(--text-sub); padding:40px; }
</style>
</head>
<body>
<div class="container">
  <header>
    <div>
      <h1>🔑 VDS License Manager</h1>
      <p>Quản lý kích hoạt bản quyền iOS Tweak &nbsp;|&nbsp; <span id="adminName" style="color:#818cf8"></span></p>
    </div>
    <div class="header-actions">
      <input class="search-box" type="text" id="searchBox" placeholder="🔍 Tìm key, khách hàng..." oninput="filterTable()">
      <button class="btn" onclick="loadKeys()">🔄 Làm Mới</button>
      <button class="btn btn-outline" onclick="logout()">Đăng Xuất</button>
    </div>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="label">Tổng số Key</div>
      <div class="value" id="statTotal">0</div>
    </div>
    <div class="stat-card">
      <div class="label">Đang Hoạt Động</div>
      <div class="value" id="statActive" style="color:var(--success)">0</div>
    </div>
    <div class="stat-card">
      <div class="label">Đã Gắn Thiết Bị</div>
      <div class="value" id="statBound" style="color:#818cf8">0</div>
    </div>
    <div class="stat-card">
      <div class="label">Hết Hạn / Khóa</div>
      <div class="value" id="statExpired" style="color:var(--danger)">0</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">➕ Tạo License Key Mới</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Ghi chú (Tên khách / Zalo)</label>
        <input type="text" id="keyNote" placeholder="Nguyễn Văn A">
      </div>
      <div class="form-group">
        <label>Thời hạn</label>
        <select id="keyDuration">
          <option value="1">1 Ngày (Dùng thử)</option>
          <option value="7">7 Ngày (1 Tuần)</option>
          <option value="30" selected>30 Ngày (1 Tháng)</option>
          <option value="90">90 Ngày (3 Tháng)</option>
          <option value="365">365 Ngày (1 Năm)</option>
          <option value="3650">Vĩnh Viễn (10 Năm)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Gói tính năng</label>
        <select id="keyPackage">
          <option value="VIP">VIP (Toàn bộ tính năng)</option>
          <option value="BASIC">Cơ bản</option>
        </select>
      </div>
      <div class="form-group">
        <label>Key tuỳ chỉnh (để trống = tự tạo)</label>
        <input type="text" id="customKey" placeholder="VIP-BANBE-2026">
      </div>
      <div class="form-group" style="justify-content:flex-end">
        <button class="btn" onclick="createKey()" id="createBtn">Tạo Key</button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">📋 Danh Sách License Key (<span id="keyCount">0</span>)</div>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Mã Key</th>
            <th>Khách Hàng</th>
            <th>Gói</th>
            <th>Hạn Sử Dụng</th>
            <th>Trạng Thái</th>
            <th>Thiết Bị</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody id="keyTableBody">
          <tr><td colspan="7" class="empty-state">Đang tải...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
let allKeys = [];

function showToast(msg, color = '#10b981') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

async function loadKeys() {
  const res = await fetch('/admin/api/keys');
  if (res.status === 401) { window.location.href = '/login'; return; }
  allKeys = await res.json();
  renderTable(allKeys);
}

function filterTable() {
  const q = document.getElementById('searchBox').value.toLowerCase();
  renderTable(allKeys.filter(k =>
    k.key.toLowerCase().includes(q) ||
    (k.note || '').toLowerCase().includes(q)
  ));
}

function renderTable(keys) {
  const tbody = document.getElementById('keyTableBody');
  tbody.innerHTML = '';
  const now = Date.now();
  let active = 0, bound = 0, expired = 0;

  if (!keys.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Chưa có Key nào. Hãy tạo một Key mới ở trên!</td></tr>';
  }

  keys.forEach(k => {
    const isExpired = now > k.expires_at;
    const isLocked  = !k.is_active;
    if (!isExpired && !isLocked) active++;
    if (k.device_id) bound++;
    if (isExpired || isLocked) expired++;

    let statusHtml = '<span class="badge badge-active">Hoạt động</span>';
    if (isLocked)        statusHtml = '<span class="badge badge-locked">Đã Khóa</span>';
    else if (isExpired)  statusHtml = '<span class="badge badge-expired">Hết Hạn</span>';

    const expDate = new Date(k.expires_at).toLocaleDateString('vi-VN');
    const remaining = Math.max(0, Math.ceil((k.expires_at - now) / 86400000));
    const expText = isExpired ? expDate : expDate + ' (' + remaining + ' ngày)';

    const deviceHtml = k.device_id
      ? '<span class="device-id" title="' + k.device_id + '">' + k.device_id.substring(0, 12) + '...</span>'
      : '<span style="color:var(--text-sub);font-size:12px">(Chưa kích hoạt)</span>';

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="key-badge">' + k.key + '</span>' +
        '<button class="copy-btn" onclick="copyKey(\\'' + k.key + '\\')" title="Copy">📋</button></td>' +
      '<td>' + (k.note || '-') + '</td>' +
      '<td><b>' + k.package_name + '</b></td>' +
      '<td style="font-size:13px">' + expText + '</td>' +
      '<td>' + statusHtml + '</td>' +
      '<td>' + deviceHtml + '</td>' +
      '<td>' +
        (k.device_id ? '<button class="action-btn" onclick="resetDevice(\\'' + k.key + '\\')" title="Gỡ thiết bị">Gỡ Máy</button>' : '') +
        '<button class="action-btn" onclick="toggleKey(\\'' + k.key + '\\',' + (k.is_active ? 0 : 1) + ')">' + (k.is_active ? 'Khóa' : 'Mở') + '</button>' +
        '<button class="action-btn del" onclick="deleteKey(\\'' + k.key + '\\')">Xóa</button>' +
      '</td>';
    tbody.appendChild(tr);
  });

  document.getElementById('statTotal').textContent   = allKeys.length;
  document.getElementById('statActive').textContent  = active;
  document.getElementById('statBound').textContent   = bound;
  document.getElementById('statExpired').textContent = expired;
  document.getElementById('keyCount').textContent    = keys.length;
}

function copyKey(key) {
  navigator.clipboard.writeText(key).then(() => showToast('✅ Đã copy: ' + key));
}

async function createKey() {
  const btn = document.getElementById('createBtn');
  btn.disabled = true; btn.textContent = 'Đang tạo...';
  const res = await fetch('/admin/api/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      note: document.getElementById('keyNote').value,
      durationDays: document.getElementById('keyDuration').value,
      packageName:  document.getElementById('keyPackage').value,
      customKey:    document.getElementById('customKey').value
    })
  });
  const data = await res.json();
  btn.disabled = false; btn.textContent = 'Tạo Key';
  if (data.success) {
    showToast('✅ Đã tạo key: ' + data.key);
    document.getElementById('keyNote').value = '';
    document.getElementById('customKey').value = '';
    loadKeys();
  } else {
    showToast('❌ ' + (data.message || 'Lỗi tạo key'), '#ef4444');
  }
}

async function resetDevice(key) {
  if (!confirm('Gỡ thiết bị cho key ' + key + '? Người dùng có thể kích hoạt trên máy mới.')) return;
  await fetch('/admin/api/reset-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  showToast('✅ Đã gỡ thiết bị!');
  loadKeys();
}

async function toggleKey(key, newStatus) {
  await fetch('/admin/api/toggle-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, isActive: newStatus })
  });
  showToast(newStatus === 1 ? '✅ Đã mở khoá key!' : '🔒 Đã khoá key!');
  loadKeys();
}

async function deleteKey(key) {
  if (!confirm('Xoá vĩnh viễn key ' + key + '?')) return;
  await fetch('/admin/api/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  showToast('🗑️ Đã xoá key!');
  loadKeys();
}

async function logout() {
  await fetch('/api/web?path=logout', { method: 'POST' });
  window.location.href = '/login';
}

loadKeys();
</script>
</body>
</html>`;

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path') || '';

  // POST /login
  if (req.method === 'POST' && path === 'login') {
    const { username, password } = req.body || {};
    if (validateLogin(username, password)) {
      const cookie = createSessionCookie(username);
      res.setHeader('Set-Cookie', cookie);
      return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' });
  }

  // POST /logout
  if (req.method === 'POST' && path === 'logout') {
    res.setHeader('Set-Cookie', 'vs_session=; Path=/; Max-Age=0; HttpOnly');
    return res.status(200).json({ success: true });
  }

  // GET /login page
  if (path === 'login') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(LOGIN_PAGE);
  }

  // All other GET → check auth → serve dashboard
  if (!checkAdminAuth(req)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(LOGIN_PAGE);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(DASHBOARD_PAGE);
}
