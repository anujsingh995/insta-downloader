// ============================================================
// controllers/media.controller.js
// Thin layer: validates input, calls service, sends response
// ============================================================

const mediaService = require('../services/media.service');
const cache = require('../utils/cache');
const { incrementDownloads, recordEvent } = require('../utils/stats');

async function fetchMedia(req, res, next) {
  try {
    const { url } = req.body;

    const cached = cache.get(url);
    if (cached) {
      console.log(`[cache] HIT for ${url}`);
      return res.json({ source: 'cache', ...cached });
    }

    const result = await mediaService.extractMedia(url);
    recordEvent('fetch');
    cache.set(url, result);

    return res.json({ source: 'fresh', ...result });
  } catch (err) {
    next(err);
  }
}

async function fetchProfile(req, res, next) {
  try {
    const { url, username } = req.body;
    const result = await mediaService.extractProfile(url, username);
    recordEvent('profile');
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function proxyDownload(req, res, next) {
  try {
    const mediaUrl = String(req.query.url || '');

    if (!mediaUrl) {
      return res.status(400).json({ error: 'Missing url query param' });
    }

    let counted = false;

    res.on('finish', () => {
      if (!counted && res.statusCode >= 200 && res.statusCode < 300) {
        counted = true;
        const total = incrementDownloads({
          country: req.get('cf-ipcountry') || req.get('x-vercel-ip-country') || 'Unknown',
          device: /mobile|android|iphone|ipad/i.test(req.get('user-agent') || '') ? 'Mobile' : 'Desktop',
          path: req.path
        });
        console.log(`[downloads] total=${total}`);
      }
    });

    await mediaService.streamMedia(mediaUrl, res);
  } catch (err) {
    next(err);
  }
}

module.exports = { fetchMedia, fetchProfile, proxyDownload };
