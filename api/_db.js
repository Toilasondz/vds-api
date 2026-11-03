// api/_db.js — Shared in-memory + KV storage layer
// Uses Vercel KV (Redis) when available, falls back to in-memory Map for local dev

let kv = null;
let inMemory = new Map();

// Pre-seeded data for immediate use
const SEED_KEYS = [
  {
    key: 'VDS-HSON-2026-VIP',
    note: 'hson - Admin Key',
    device_id: null,
    package_name: 'VIP',
    created_at: Date.now(),
    expires_at: Date.now() + (3650 * 24 * 60 * 60 * 1000), // 10 years
    is_active: 1
  },
  {
    key: 'VDS-FREE-TRIAL-001',
    note: 'Demo Key',
    device_id: null,
    package_name: 'BASIC',
    created_at: Date.now(),
    expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    is_active: 1
  }
];

async function getKV() {
  if (kv) return kv;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
    // Seed initial keys if not already seeded
    const seeded = await kv.get('__seeded__');
    if (!seeded) {
      for (const k of SEED_KEYS) {
        await kv.hset('key:' + k.key, k);
        await kv.sadd('all_keys', k.key);
      }
      await kv.set('__seeded__', '1');
    }
    return kv;
  } catch (e) {
    return null; // fallback to inMemory
  }
}

// ── Init in-memory seed ──────────────────────────────────────────────────────
for (const k of SEED_KEYS) {
  inMemory.set(k.key, { ...k });
}

// ── DB helpers ───────────────────────────────────────────────────────────────
export async function getAllKeys() {
  const store = await getKV();
  if (store) {
    const keys = await store.smembers('all_keys');
    if (!keys || keys.length === 0) return [];
    const rows = await Promise.all(keys.map(k => store.hgetall('key:' + k)));
    return rows
      .filter(Boolean)
      .map(normalizeRow)
      .sort((a, b) => b.created_at - a.created_at);
  }
  // In-memory fallback
  return [...inMemory.values()].sort((a, b) => b.created_at - a.created_at);
}

export async function getKey(key) {
  const store = await getKV();
  if (store) {
    const row = await store.hgetall('key:' + key);
    return row ? normalizeRow(row) : null;
  }
  return inMemory.get(key) || null;
}

export async function createKey(keyData) {
  const store = await getKV();
  if (store) {
    const existing = await store.hgetall('key:' + keyData.key);
    if (existing) throw new Error('Key already exists');
    await store.hset('key:' + keyData.key, keyData);
    await store.sadd('all_keys', keyData.key);
  } else {
    if (inMemory.has(keyData.key)) throw new Error('Key already exists');
    inMemory.set(keyData.key, keyData);
  }
}

export async function updateKey(key, fields) {
  const store = await getKV();
  if (store) {
    await store.hset('key:' + key, fields);
  } else {
    const row = inMemory.get(key);
    if (row) inMemory.set(key, { ...row, ...fields });
  }
}

export async function deleteKey(key) {
  const store = await getKV();
  if (store) {
    await store.del('key:' + key);
    await store.srem('all_keys', key);
  } else {
    inMemory.delete(key);
  }
}

function normalizeRow(row) {
  return {
    ...row,
    created_at: Number(row.created_at),
    expires_at:  Number(row.expires_at),
    is_active:   Number(row.is_active)
  };
}
