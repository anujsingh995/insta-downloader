const express = require('express');
const rateLimit = require('express-rate-limit');
const { adminLogin, adminLogout, adminStats } = require('../controllers/admin.controller');
const { requireAdmin } = require('../utils/adminAuth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many admin login attempts. Try again later.' }
});

router.post('/login', loginLimiter, adminLogin);
router.post('/logout', requireAdmin, adminLogout);
router.get('/stats', requireAdmin, adminStats);

module.exports = router;
