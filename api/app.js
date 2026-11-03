// api/app.js — Public API for iPhone/Tweak verification (no auth required)

import { getKey, updateKey } from './_db.js';

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path') || '';

  // ── POST /api/verify ──────────────────────────────────────────────────────
  if (req.method === 'POST' && path === 'verify') {
    const { key, deviceID } = req.body || {};

    if (!key || !deviceID) {
      return res.status(400).json({
        authorized: false,
        message: 'Thiếu mã Key hoặc Device ID!'
      });
    }

    const row = await getKey(key);

    if (!row) {
      return res.status(404).json({
        authorized: false,
        message: 'Key không hợp lệ hoặc không tồn tại!'
      });
    }

    if (!row.is_active) {
      return res.status(403).json({
        authorized: false,
        message: 'Key này đã bị tạm khóa bởi quản trị viên!'
      });
    }

    if (Date.now() > row.expires_at) {
      return res.status(403).json({
        authorized: false,
        message: 'Key đã hết hạn sử dụng!'
      });
    }

    // Bind device on first use
    if (!row.device_id) {
      await updateKey(key, { device_id: deviceID });
    } else if (row.device_id !== deviceID) {
      return res.status(403).json({
        authorized: false,
        message: 'Key đã được kích hoạt trên thiết bị khác!'
      });
    }

    const remainingDays = Math.ceil((row.expires_at - Date.now()) / 86400000);
    return res.json({
      authorized: true,
      message: `Xác thực thành công! Gói: ${row.package_name}`,
      packageName: row.package_name,
      expiresAt: row.expires_at,
      remainingDays
    });
  }

  // ── POST /api/sign-out ────────────────────────────────────────────────────
  if (req.method === 'POST' && path === 'sign-out') {
    const { key, deviceID } = req.body || {};
    const row = await getKey(key);
    if (!row || row.device_id !== deviceID) {
      return res.status(400).json({ success: false, message: 'Không thể gỡ thiết bị!' });
    }
    await updateKey(key, { device_id: null });
    return res.json({ success: true, message: 'Đã gỡ liên kết thành công!' });
  }

  return res.status(404).json({ message: 'Endpoint không tồn tại!' });
}
