const Url = require('../models/url.model');
const redis = require('../config/redis');
const { createShortUrl } = require('../services/shortener.service');

// CREATE SHORT URL
shorten = async (req, res) => {
  const { longUrl } = req.body;
  const url = await createShortUrl(longUrl);

  await redis.set(url.shortCode, url.longUrl);
  res.json({ shortUrl: `${process.env.BASE_URL}/${url.shortCode}` });
};

// REDIRECT
redirect = async (req, res) => {
  const { code } = req.params;

  const cachedUrl = await redis.get(code);
  if (cachedUrl) {
    console.log("Redis is called")
    return res.redirect(302, cachedUrl);
  }

  const url = await Url.findOneAndUpdate(
    { shortCode: code },
    {
      $push: {
        visitHistory: { timestamp: Date.now() }
      }
    },
    { new: true }
  );
  
    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }
  // const url = await Url.findOne({ shortCode: code });
  // if (!url) return res.status(404).send("Not found");

  url.clicks++;
  await url.save();

  await redis.set(code, url.longUrl);
  res.redirect(302, url.longUrl);
};

module.exports = {
  shorten,
  redirect
};
