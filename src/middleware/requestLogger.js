// ============================================================
//  middleware/requestLogger.js
//  Structured per-request log line: method, path, IP, ms
// ============================================================

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms      = Date.now() - start;
    const ip      = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const method  = req.method.padEnd(4);
    const status  = res.statusCode;
    const path    = req.originalUrl;

    const color =
      status >= 500 ? '\x1b[31m' :   // red
      status >= 400 ? '\x1b[33m' :   // yellow
      status >= 300 ? '\x1b[36m' :   // cyan
                      '\x1b[32m';    // green
    const reset = '\x1b[0m';

    console.log(`${color}${method} ${status}${reset} ${path} — ${ip} — ${ms}ms`);
  });

  next();
}

module.exports = requestLogger;
