// ============================================================
// server.js – Express entry point
// ============================================================

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const mediaRoutes = require('./routes/media.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.set('trust proxy', 1);

const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.static(frontendPath));
app.use(helmet());

app.use(cors({
  origin: config.ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(requestLogger);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down.' },
});
app.use(globalLimiter);

app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`[server] Running on port ${config.PORT} (${config.NODE_ENV})`);
});

module.exports = app;
