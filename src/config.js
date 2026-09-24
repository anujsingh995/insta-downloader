// ============================================================
// config.js
// ============================================================
require('dotenv').config();

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  FETCH_TIMEOUT_MS: Number(process.env.FETCH_TIMEOUT_MS || 30000),
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 300),
  MAX_PROXY_BYTES: Number(process.env.MAX_PROXY_BYTES || 100 * 1024 * 1024),
  STATS_DATA_DIR: process.env.STATS_DATA_DIR || '',
  APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || '',
  APIFY_PROFILE_ACTOR: process.env.APIFY_PROFILE_ACTOR || 'fetch_cat~instagram-profile-posts-scraper',
  APIFY_MAX_POSTS: Number(process.env.APIFY_MAX_POSTS || 50),
  USER_AGENT:
    process.env.USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
};
