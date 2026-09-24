const { recordEvent } = require('../utils/stats');

function deviceFromUserAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(ua)) return 'Tablet';
  if (/mobile|android|iphone|ipod/.test(ua)) return 'Mobile';
  return 'Desktop';
}

function countryFromRequest(req) {
  return (
    req.get('cf-ipcountry') ||
    req.get('x-vercel-ip-country') ||
    req.get('x-country-code') ||
    'Unknown'
  ).toUpperCase();
}

function track(req, res) {
  const type = String(req.body?.type || '').toLowerCase();
  if (!['visit', 'fetch', 'profile'].includes(type)) {
    return res.status(400).json({ error: 'Unsupported analytics event.' });
  }

  recordEvent(type, {
    country: countryFromRequest(req),
    device: deviceFromUserAgent(req.get('user-agent') || ''),
    path: String(req.body?.path || '').slice(0, 200)
  });

  res.status(204).end();
}

module.exports = { track, deviceFromUserAgent, countryFromRequest };
