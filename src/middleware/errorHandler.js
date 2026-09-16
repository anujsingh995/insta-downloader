// ============================================================
//  middleware/errorHandler.js
//  Catches anything thrown/passed via next(err) anywhere in
//  the app and returns a consistent JSON error shape.
// ============================================================

function errorHandler(err, req, res, _next) {
  // Log the full stack in dev, just the message in prod
  if (process.env.NODE_ENV === 'development') {
    console.error('[error]', err.stack);
  } else {
    console.error('[error]', err.message);
  }

  // Known "user-facing" errors have a statusCode attached
  const statusCode = err.statusCode || 500;
  const message    = err.statusCode
    ? err.message
    : 'Something went wrong on our end. Please try again.';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
