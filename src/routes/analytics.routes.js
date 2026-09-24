const express = require('express');
const rateLimit = require('express-rate-limit');
const { track } = require('../controllers/analytics.controller');

const router = express.Router();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Analytics rate limit exceeded.' }
});

router.post('/track', limiter, track);

module.exports = router;
