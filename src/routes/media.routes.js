// ============================================================
// routes/media.routes.js
// All /api/media endpoints
// ============================================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const mediaController = require('../controllers/media.controller');
const validateUrl = require('../middleware/validateUrl');
const validateProfileUrl = require('../middleware/validateProfileUrl');
const { getDownloads } = require('../utils/stats');

const router = express.Router();

const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Download rate limit exceeded. Wait a minute.' },
});

const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Profile fetch rate limit exceeded. Wait a minute.' },
});

router.post('/fetch', downloadLimiter, validateUrl, mediaController.fetchMedia);
router.post('/profile', profileLimiter, validateProfileUrl, mediaController.fetchProfile);
router.get('/proxy', downloadLimiter, mediaController.proxyDownload);

router.get('/stats', (_req, res) => {
  res.json({ downloads: getDownloads() });
});

module.exports = router;
