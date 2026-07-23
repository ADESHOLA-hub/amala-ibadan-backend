const mongoose = require('mongoose');

// Single shared settings document for the whole site.
// We only ever have ONE row here — always fetched/updated by a fixed key.
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'site-settings', unique: true },
  maxPortionsPerPlate: { type: Number, default: 4, min: 1 },
});

module.exports = mongoose.model('Settings', settingsSchema);
