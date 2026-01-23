const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const router = express.Router();

router.get('/api1', rateLimiter, (req, res) => {
  res.json({ message: 'API 1 response' });
});

module.exports = router;
