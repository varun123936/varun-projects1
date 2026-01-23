const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.headers['x-user-id'] || req.ip;
    return `rate-limit:${userId}:${req.originalUrl}`;
  },
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: '15 requests allowed per 60 seconds'
    });
  }
});

module.exports = rateLimiter;
