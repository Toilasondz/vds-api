// api/admin.js — Admin API endpoints (protected)

import { checkAdminAuth } from './_auth.js';
import { getAllKeys, getKey, createKey, updateKey, deleteKey } from './_db.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Auth check on every admin endpoint
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path') || '';

  // GET /admin/api/keys → list all keys
  if (req.method === 'GET' && path === 'keys') {
    const keys = await getAllKeys();
    return res.json(keys);
  }

  // POST /admin/api/create → create new key
  if (req.method === 'POST' && path === 'create') {
    const { note, durationDays, packageName, customKey } = req.body || {};
    const key = (customKey && customKey.trim())
      ? customKey.trim().toUpperCase()
      : 'VDS-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const days = Math.max(1, parseInt(durationDays) || 30);
    const now = Date.now();
    const keyData = {
      key,
      note: note || 'Khách hàng',
      device_id: null,
      package_name: packageName || 'VIP',
      created_at: now,
      expires_at: now + days * 86400000,
      is_active: 1
    };
    try {
      await createKey(keyData);
      return res.json({ success: true, key, expiresAt: keyData.expires_at });
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Key đã tồn tại hoặc lỗi tạo key!' });
    }
  }

  // POST /admin/api/reset-device
  if (req.method === 'POST' && path === 'reset-device') {
    const { key } = req.body || {};
    await updateKey(key, { device_id: null });
    return res.json({ success: true });
  }

  // POST /admin/api/toggle-status
  if (req.method === 'POST' && path === 'toggle-status') {
    const { key, isActive } = req.body || {};
    await updateKey(key, { is_active: isActive ? 1 : 0 });
    return res.json({ success: true });
  }

  // POST /admin/api/delete
  if (req.method === 'POST' && path === 'delete') {
    const { key } = req.body || {};
    await deleteKey(key);
    return res.json({ success: true });
  }

  return res.status(404).json({ success: false, message: 'Endpoint không tồn tại!' });
}
