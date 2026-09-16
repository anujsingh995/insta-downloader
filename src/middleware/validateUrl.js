// Validate canonical public Instagram content URLs.
// This intentionally rejects arbitrary URLs.
const VALID_PATTERNS = [
  /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+\/?$/i,
  /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+\/?$/i,
  /^https?:\/\/(www\.)?instagram\.com\/reels\/[\w-]+\/?$/i,
  /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+\/?$/i,
  /^https?:\/\/(www\.)?instagram\.com\/stories\/[\w.-]+\/\d+\/?$/i,
];

function validateUrl(req, res, next) {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "url" field.' });
  }

  const trimmed = url.trim();

  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'URL is too long.' });
  }

  // Strip query/hash before validation; IG share links commonly add ?igsh=...
  const clean = trimmed.split(/[?#]/)[0].replace(/\/+$/, '');

  if (!VALID_PATTERNS.some((pattern) => pattern.test(clean))) {
    return res.status(400).json({
      error: 'Enter a canonical public Instagram post, reel, IGTV, or story URL.',
    });
  }

  req.body.url = clean;
  next();
}

module.exports = validateUrl;
