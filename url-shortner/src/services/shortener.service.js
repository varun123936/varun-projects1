const Url = require('../models/url.model');
const encodeBase62 = require('../utils/base62');

async function createShortUrl(longUrl) {
  const count = await Url.countDocuments();
  const shortCode = encodeBase62(count + 1);

  const url = await Url.create({
    shortCode,
    longUrl,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  return url;
}

module.exports = { createShortUrl };
