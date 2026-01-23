const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: { type: String, unique: true, index: true },
  longUrl: { type: String, required: true },
  visitHistory: [{ timestamp: { type: Number }, },],
  clicks: { type: Number, default: 0 },
  expiresAt: { type: Date }
}, { timestamps: true });

// TTL index for expiry
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);
