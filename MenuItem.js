const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  maxPerPlate: {
    type: Number,
    default: null,
    min: 1,
    // Leave unset/null for "no special limit" — only bounded by the plate's overall max
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
