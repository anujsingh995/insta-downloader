// ============================================================
//  routes/media.routes.js
//  All /api/media endpoints
// ============================================================

const express        = require('express');
const rateLimit      = require('express-rate-limit');
const mediaController = require('../controllers/media.controller');
const validateUrl    = require('../middleware/validateUrl');

const router = express.Router();

// Stricter limiter just for the download endpoint (20 req / min per IP)
const downloadLimiter = rateLimit({
  windowMs : 60 * 1000,
  max      : 20,
  message  : { error: 'Download rate limit exceeded. Wait a minute.' },
});

// POST /api/media/fetch
// Body: { url: "https://www.instagram.com/p/..." }
// Returns: { type, items: [{ url, quality, ext }] }
router.post('/fetch', downloadLimiter, validateUrl, mediaController.fetchMedia);

// GET /api/media/proxy?url=<encoded-media-url>
// Streams the actual file through our server so the browser can trigger a download
router.get('/proxy', downloadLimiter, mediaController.proxyDownload);

module.exports = router;
