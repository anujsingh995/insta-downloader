// ============================================================
// config.js
// ============================================================
require('dotenv').config();

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  FETCH_TIMEOUT_MS: Number(process.env.FETCH_TIMEOUT_MS || 30000),
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 300),
  MAX_PROXY_BYTES: Number(process.env.MAX_PROXY_BYTES || 100 * 1024 * 1024),
  USER_AGENT:
    process.env.USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
};
