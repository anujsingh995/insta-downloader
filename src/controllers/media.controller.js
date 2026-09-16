// ============================================================
//  controllers/media.controller.js
//  Thin layer: validates input, calls service, sends response
// ============================================================

const mediaService = require('../services/media.service');
const cache        = require('../utils/cache');

// POST /api/media/fetch
async function fetchMedia(req, res, next) {
  try {
    const { url } = req.body;

    // 1. Check in-memory cache first
    const cached = cache.get(url);
    if (cached) {
      console.log(`[cache] HIT for ${url}`);
      return res.json({ source: 'cache', ...cached });
    }

    // 2. Delegate to service layer
    const result = await mediaService.extractMedia(url);

    // 3. Store in cache to avoid redundant fetches
    cache.set(url, result);

    return res.json({ source: 'fresh', ...result });
  } catch (err) {
    next(err);   // forwarded to centralised errorHandler
  }
}

// GET /api/media/proxy?url=<encoded-direct-media-url>
async function proxyDownload(req, res, next) {
  try {
    const mediaUrl = String(req.query.url || '');
    if (!mediaUrl) {
      return res.status(400).json({ error: 'Missing url query param' });
    }

    await mediaService.streamMedia(mediaUrl, res);
  } catch (err) {
    next(err);
  }
}

module.exports = { fetchMedia, proxyDownload };
