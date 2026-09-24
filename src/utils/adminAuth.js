const crypto = require('crypto');

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

function cleanup() {
  const now = Date.now();
  for (const [token, expiresAt] of sessions) {
    if (expiresAt <= now) sessions.delete(token);
  }
}

function login(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  if (!expectedUser || !expectedPassword) return null;
  if (username !== expectedUser || password !== expectedPassword) return null;

  cleanup();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isValid(token) {
  cleanup();
  if (!token) return false;
  const expiresAt = sessions.get(token);
  return Boolean(expiresAt && expiresAt > Date.now());
}

function logout(token) {
  if (token) sessions.delete(token);
}

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-session');
  if (!isValid(token)) return res.status(401).json({ error: 'Admin authentication required.' });
  next();
}

module.exports = { login, isValid, logout, requireAdmin };
