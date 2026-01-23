const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const router = express.Router();

router.get('/api3', rateLimiter, (req, res) => {
  res.json({ message: 'API 3 response' });
});

module.exports = router;
