const mongoose = require('mongoose');

const cateringPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    // Free-form paragraph, used for single-dish cards (e.g. Specials, Starters)
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // List of inclusions, used for package cards (e.g. Breakfast, Owambe, Food Bowls)
    inclusions: {
      type: [String],
      default: [],
    },
    // Display price exactly as shown to customers — supports ranges/"From"/"+"
    // since these are quote-style prices, not cart-calculable numbers
    priceLabel: {
      type: String,
      required: [true, 'Price label is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'breakfast',
        'owambe',
        'specials',
        'afterparty',
        'starters',
        'lunchpacks',
        'foodbowls',
      ],
    },
    minGuests: {
      type: Number,
      default: null, // null = no minimum (single-dish items)
    },
    icon: {
      type: String,
      default: '🍽️', // emoji shown in the icon circle
    },
    ribbon: {
      type: String,
      default: '', // e.g. "Popular", "Best Seller" — empty means no ribbon shown
    },
    ribbonGold: {
      type: Boolean,
      default: false, // true = gold ribbon style, false = default ribbon style
    },
    featured: {
      type: Boolean,
      default: false, // true = highlighted "featured" card styling
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CateringPackage', cateringPackageSchema);
