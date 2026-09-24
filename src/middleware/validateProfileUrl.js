const RESERVED = new Set([
  'p', 'reel', 'reels', 'tv', 'stories', 'explore', 'accounts', 'direct',
  'about', 'developer', 'web', 'emails', 'legal', 'privacy', 'terms'
]);

function validateProfileUrl(req, res, next) {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "url" field.' });
  }

  const trimmed = url.trim();
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'URL is too long.' });
  }

  const clean = trimmed.split(/[?#]/)[0].replace(/\/+$/, '');
  const match = clean.match(/^https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})$/i);

  if (!match || RESERVED.has(match[1].toLowerCase())) {
    return res.status(400).json({
      error: 'Enter a valid public Instagram profile URL, for example https://www.instagram.com/username/',
    });
  }

  req.body.url = `${clean}/`;
  req.body.username = match[1];
  next();
}

module.exports = validateProfileUrl;
