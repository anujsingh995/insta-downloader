const { login, logout } = require('../utils/adminAuth');
const { getSnapshot } = require('../utils/stats');

function adminLogin(req, res) {
  const { username, password } = req.body || {};
  const token = login(String(username || ''), String(password || ''));
  if (!token) return res.status(401).json({ error: 'Invalid admin credentials.' });
  res.json({ token });
}

function adminLogout(req, res) {
  logout(req.get('x-admin-session'));
  res.json({ ok: true });
}

function adminStats(_req, res) {
  const snapshot = getSnapshot();
  const days = Object.entries(snapshot.daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, values]) => ({ date, ...values }));

  const countries = Object.entries(snapshot.byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const devices = Object.entries(snapshot.byDevice)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  res.json({
    totals: {
      downloads: snapshot.totalDownloads,
      visits: snapshot.totalVisits,
      fetches: snapshot.totalFetches,
      profiles: snapshot.totalProfileFetches
    },
    days,
    countries,
    devices,
    recent: snapshot.recent.slice(0, 30)
  });
}

module.exports = { adminLogin, adminLogout, adminStats };
