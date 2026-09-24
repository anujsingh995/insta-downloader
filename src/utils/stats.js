const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.STATS_DATA_DIR || path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'stats.json');

const EMPTY_STATS = {
  totalDownloads: 1000,
  totalVisits: 0,
  totalFetches: 0,
  totalProfileFetches: 0,
  byCountry: {},
  byDevice: {},
  byEvent: {},
  daily: {},
  recent: []
};

let stats = loadStats();

function loadStats() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
      writeStats(EMPTY_STATS);
      return structuredClone(EMPTY_STATS);
    }

    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    return {
      ...structuredClone(EMPTY_STATS),
      ...parsed,
      byCountry: parsed.byCountry || {},
      byDevice: parsed.byDevice || {},
      byEvent: parsed.byEvent || {},
      daily: parsed.daily || {},
      recent: Array.isArray(parsed.recent) ? parsed.recent : []
    };
  } catch (error) {
    console.warn('[stats] load failed:', error.message);
    return structuredClone(EMPTY_STATS);
  }
}

function writeStats(nextStats) {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const temp = `${DATA_FILE}.tmp`;

  fs.writeFileSync(
    temp,
    JSON.stringify(nextStats, null, 2)
  );

  fs.renameSync(temp, DATA_FILE);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function recordEvent(type, meta = {}) {
  if (type === 'download') stats.totalDownloads += 1;
  if (type === 'visit') stats.totalVisits += 1;
  if (type === 'fetch') stats.totalFetches += 1;
  if (type === 'profile') stats.totalProfileFetches += 1;

  stats.byEvent[type] = (stats.byEvent[type] || 0) + 1;

  if (meta.country) {
    stats.byCountry[meta.country] =
      (stats.byCountry[meta.country] || 0) + 1;
  }

  if (meta.device) {
    stats.byDevice[meta.device] =
      (stats.byDevice[meta.device] || 0) + 1;
  }

  const day = todayKey();

  stats.daily[day] ||= {
    visits: 0,
    downloads: 0,
    fetches: 0,
    profiles: 0
  };

  if (type === 'visit') stats.daily[day].visits += 1;
  if (type === 'download') stats.daily[day].downloads += 1;
  if (type === 'fetch') stats.daily[day].fetches += 1;
  if (type === 'profile') stats.daily[day].profiles += 1;

  stats.recent.unshift({
    type,
    at: new Date().toISOString(),
    country: meta.country || 'Unknown',
    device: meta.device || 'Unknown',
    path: meta.path || ''
  });

  stats.recent = stats.recent.slice(0, 100);

  try {
    writeStats(stats);
  } catch (error) {
    console.warn('[stats] write failed:', error.message);
  }

  return stats;
}

function getDownloads() {
  return stats.totalDownloads;
}

function incrementDownloads(meta = {}) {
  return recordEvent('download', meta).totalDownloads;
}

function getSnapshot() {
  return JSON.parse(JSON.stringify(stats));
}

module.exports = {
  getDownloads,
  incrementDownloads,
  recordEvent,
  getSnapshot
};