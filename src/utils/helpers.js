// ============================================================
//  utils/helpers.js
//  Small pure functions used across the codebase
// ============================================================

// ── detectType(postUrl, items) ────────────────────────────────
//  Figures out the content category from the URL shape and items
function detectType(url, items) {
  if (/\/reel(s)?\//i.test(url))   return 'reel';
  if (/\/tv\//i.test(url))         return 'igtv';
  if (/\/stories\//i.test(url))    return 'story';
  if (items.length > 1)            return 'carousel';
  if (items.some(i => i.ext === 'mp4')) return 'video';
  return 'photo';
}

// ── buildFilename(ext, index?) ────────────────────────────────
//  Returns e.g. "instagram_1720000000000_1.mp4"
function buildFilename(ext, index = null) {
  const ts     = Date.now();
  const suffix = index !== null ? `_${index}` : '';
  return `instagram_${ts}${suffix}.${ext}`;
}

// ── isValidHttpUrl(str) ───────────────────────────────────────
function isValidHttpUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { detectType, buildFilename, isValidHttpUrl };
