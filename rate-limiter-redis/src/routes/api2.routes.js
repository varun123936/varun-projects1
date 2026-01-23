const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const router = express.Router();

router.get('/api2', rateLimiter, (req, res) => {
  res.json({ message: 'API 2 response' });
});

module.exports = router;
