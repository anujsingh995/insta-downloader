// ============================================================
//  utils/cache.js
//  Lightweight in-memory key-value store with TTL expiry.
//  For production you'd swap this out for Redis.
// ============================================================

const config = require('../config');

// Map structure: key → { value, expiresAt }
const store = new Map();

// ── set(key, value) ──────────────────────────────────────────
function set(key, value) {
  const expiresAt = Date.now() + config.CACHE_TTL_SECONDS * 1000;
  store.set(key, { value, expiresAt });
}

// ── get(key) → value | null ───────────────────────────────────
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);   // Lazy eviction
    return null;
  }

  return entry.value;
}

// ── del(key) ─────────────────────────────────────────────────
function del(key) {
  store.delete(key);
}

// ── Periodic sweep: remove all expired entries every 5 min ───
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 5 * 60 * 1000);

module.exports = { set, get, del };
