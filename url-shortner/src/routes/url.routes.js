const express = require('express');
const router = express.Router();
const rateLimiter = require('../middlewares/rateLimiter');
const controller = require('../controllers/url.controller');

router.post('/shorten', rateLimiter, controller.shorten);
router.get('/:code', controller.redirect);

module.exports = router;
