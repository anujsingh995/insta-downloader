// ============================================================
//  server.js  –  Entry point
//  Boots Express, wires middleware and routes, starts listening
// ============================================================
const path = require('path');
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const config        = require('./config');
const mediaRoutes   = require('./routes/media.routes');
const errorHandler  = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();
app.set('trust proxy', 1);
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.static(frontendPath));

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS  (allow your frontend origin only) ───────────────────
app.use(cors({
  origin: config.ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
}));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logger (dev only) ───────────────────────────
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Custom structured request logger ─────────────────────────
app.use(requestLogger);

// ── Global rate limiter  (100 req / 15 min per IP) ───────────
const globalLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 100,
  message  : { error: 'Too many requests, please slow down.' },
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/media', mediaRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 catch-all ─────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Centralised error handler ─────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
app.listen(config.PORT, () => {
  console.log(`[server] Running on port ${config.PORT} (${config.NODE_ENV})`);
});

module.exports = app;
