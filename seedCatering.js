// seedCatering.js — run once with: node seedCatering.js
// Safe to re-run: upserts by (name + category), so it won't create duplicates.

const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const CateringPackage = require('./src/models/CateringPackage');

const packages = [
  // ── Breakfast (min 50 guests) ──────────────────────────────
  {
    name: 'Breakfast Option One', priceLabel: '₦7,500', category: 'breakfast', minGuests: 50,
    icon: '🥞', ribbon: 'Popular', ribbonGold: false, featured: false,
    inclusions: ['Club Sandwich', 'Oat Porridge with Fruits', 'Boiled Yam', 'Fish Sauce', 'Meatballs', 'Watermelon Wedges', 'Tea & Beverages'],
  },
  {
    name: 'Breakfast Option Two', priceLabel: '₦8,500', category: 'breakfast', minGuests: 50,
    icon: '☕', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Club Sandwich', 'Pancakes', 'Chicken Wrap', 'Chicken Wings', 'Boiled Plantain', 'Fish Sauce', 'Scrambled Egg', 'Sausage', 'Fruit Cup', 'Tea & Beverages'],
  },
  {
    name: 'Breakfast Option Three', priceLabel: '₦10,000', category: 'breakfast', minGuests: 50,
    icon: '👑', ribbon: 'Premium', ribbonGold: true, featured: true,
    inclusions: ['Mini Sliders', 'Mini Tortilla Wraps', 'Pasta Salad', 'Avocado Salad', 'Fruit Cup', 'Fresh Juice', 'Zobo', 'Tea & Beverages', 'Waffles', 'Pancakes', 'Chicken Kebab'],
  },

  // ── Owambe (min 100 guests) ─────────────────────────────────
  {
    name: 'Owambe Option One', priceLabel: '₦8,000', category: 'owambe', minGuests: 100,
    icon: '🍛', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Signature Abula', 'Party Jollof Rice', 'Fried Rice', 'Ofada Rice', 'Pounded Yam', 'Yam Potage', 'Peppered Chicken'],
  },
  {
    name: 'Owambe Option Two', priceLabel: '₦10,000', category: 'owambe', minGuests: 100,
    icon: '🍖', ribbon: 'Best Seller', ribbonGold: true, featured: true,
    inclusions: ['2 Protein Selection', 'Signature Abula', 'Party Rice', 'Ofada Rice', 'Pounded Yam', 'Peppered Fish', 'Fresh Fish'],
  },

  // ── Chef's Specials ─────────────────────────────────────────
  {
    name: "Ewa Aganyin Special", priceLabel: '₦10,000', category: 'specials', minGuests: null,
    icon: '🍲', ribbon: '', ribbonGold: false, featured: false,
    description: 'Served with Plantain, Beef, Ponmo, Round Fish and our Signature Aganyin Sauce.',
  },
  {
    name: 'Steamed Rice Deluxe', priceLabel: '₦12,000', category: 'specials', minGuests: null,
    icon: '🍚', ribbon: '', ribbonGold: false, featured: false,
    description: 'Fresh Fish Stew, Peppered Assorted Meat and Plantain.',
  },
  {
    name: 'Seafood Okra', priceLabel: '₦15,000', category: 'specials', minGuests: null,
    icon: '🦀', ribbon: '', ribbonGold: false, featured: true,
    description: 'Crab, Snail, Calamari, Prawn, Fresh Fish with Pounded Yam.',
  },

  // ── After Party ─────────────────────────────────────────────
  {
    name: 'Spicy Asun', priceLabel: '₦5,000', category: 'afterparty', minGuests: null,
    icon: '🔥', ribbon: '', ribbonGold: false, featured: false,
    description: 'Tender, spicy grilled goat meat tossed in our signature pepper mix.',
  },
  {
    name: 'Spicy Spaghetti', priceLabel: '₦5,000', category: 'afterparty', minGuests: null,
    icon: '🍝', ribbon: '', ribbonGold: false, featured: false,
    description: 'Stir-fried spicy spaghetti served with juicy beef chunks.',
  },
  {
    name: 'Creamy Chicken Pasta', priceLabel: '₦8,000', category: 'afterparty', minGuests: null,
    icon: '🍗', ribbon: 'Popular', ribbonGold: true, featured: true,
    description: 'Rich creamy pasta loaded with tender chicken chunks.',
  },
  {
    name: 'Yam or Plantain Fries', priceLabel: '₦5,000', category: 'afterparty', minGuests: null,
    icon: '🍟', ribbon: '', ribbonGold: false, featured: false,
    description: 'Served with pepper sauce and your choice of Chicken, Turkey or Fish Cuts.',
  },
  {
    name: 'Fries & Whole Turkey', priceLabel: '₦7,000', category: 'afterparty', minGuests: null,
    icon: '🦃', ribbon: '', ribbonGold: false, featured: false,
    description: 'Crispy fries paired with pepper sauce and an uncut turkey.',
  },
  {
    name: 'Fries & Whole Fish', priceLabel: '₦10,000', category: 'afterparty', minGuests: null,
    icon: '🐟', ribbon: '', ribbonGold: false, featured: false,
    description: 'Yam or Plantain Fries served with pepper sauce and a whole grilled fish.',
  },

  // ── Starters ────────────────────────────────────────────────
  {
    name: 'Goat Meat Pepper Soup', priceLabel: '₦5,000', category: 'starters', minGuests: null,
    icon: '🍲', ribbon: '', ribbonGold: false, featured: false,
    description: 'Rich spicy pepper soup served with a fresh dinner roll.',
  },
  {
    name: 'Catfish Pepper Soup', priceLabel: '₦5,000', category: 'starters', minGuests: null,
    icon: '🐟', ribbon: "Chef's Pick", ribbonGold: true, featured: true,
    description: 'Fresh catfish cooked in our signature pepper soup spices and served with a dinner roll.',
  },
  {
    name: 'Seafood Chowder', priceLabel: '₦7,000', category: 'starters', minGuests: null,
    icon: '🦐', ribbon: '', ribbonGold: false, featured: false,
    description: 'Creamy chowder filled with premium seafood for a luxurious start.',
  },

  // ── Lunch Packs ─────────────────────────────────────────────
  {
    name: 'Basmati Rice & Beans', priceLabel: '₦20,000', category: 'lunchpacks', minGuests: null,
    icon: '🍛', ribbon: 'Premium', ribbonGold: true, featured: true,
    description: 'Served with our rich Designer Stew.',
  },
  {
    name: 'Ofada Rice', priceLabel: '₦10,000', category: 'lunchpacks', minGuests: null,
    icon: '🍚', ribbon: '', ribbonGold: false, featured: false,
    description: 'Ayamase Sauce, Plantain, Assorted Meat, Egg & Fish.',
  },
  {
    name: 'Party Rice Combo', priceLabel: '₦10,000', category: 'lunchpacks', minGuests: null,
    icon: '🍗', ribbon: '', ribbonGold: false, featured: false,
    description: 'Party Jollof or Fried Rice with Plantain, Salad & Turkey.',
  },
  {
    name: 'Asun Jollof Rice', priceLabel: '₦10,000', category: 'lunchpacks', minGuests: null,
    icon: '🔥', ribbon: '', ribbonGold: false, featured: false,
    description: 'Party Jollof Rice served with spicy Peppered Goat Meat.',
  },
  {
    name: 'Village Rice', priceLabel: '₦10,000', category: 'lunchpacks', minGuests: null,
    icon: '🌾', ribbon: '', ribbonGold: false, featured: false,
    description: 'Traditional Village Rice served with Egg, Round Fish & Beef.',
  },
  {
    name: 'Jollof Spaghetti', priceLabel: '₦8,000', category: 'lunchpacks', minGuests: null,
    icon: '🍝', ribbon: '', ribbonGold: false, featured: false,
    description: 'Delicious Jollof Spaghetti served with Turkey.',
  },
  {
    name: 'Ewa Aganyin', priceLabel: '₦8,000', category: 'lunchpacks', minGuests: null,
    icon: '🥘', ribbon: '', ribbonGold: false, featured: false,
    description: 'Served with Plantain, Ponmo, Beef & Round Fish.',
  },
  {
    name: 'Yam & Sweet Potato Pottage', priceLabel: '₦8,000', category: 'lunchpacks', minGuests: null,
    icon: '🍠', ribbon: '', ribbonGold: false, featured: false,
    description: 'Served with Plantain, Fish, Beef and Ponmo in Sauce.',
  },
  {
    name: 'Amala Special', priceLabel: '₦8,000', category: 'lunchpacks', minGuests: null,
    icon: '🥣', ribbon: '', ribbonGold: false, featured: false,
    description: 'Amala with Gbegiri, Ewedu, Assorted Meat & Goat Meat.',
  },
  {
    name: 'Pounded Yam / Eba', priceLabel: '₦10,000', category: 'lunchpacks', minGuests: null,
    icon: '🍲', ribbon: "Chef's Pick", ribbonGold: false, featured: true,
    description: 'Served with Efo Riro or Egusi and Assorted Goat Meat.',
  },

  // ── Food Bowls ──────────────────────────────────────────────
  {
    name: 'Rice Collection', priceLabel: 'From ₦16,000', category: 'foodbowls', minGuests: null,
    icon: '🍚', ribbon: 'Best Seller', ribbonGold: true, featured: true,
    inclusions: ['Party Jollof Rice', 'Nigerian Fried Rice', 'Basmati Fried Rice', 'Village Rice', 'Asun Rice', 'Rice & Beans', 'Ofada Rice', 'Ayamase Sauce'],
  },
  {
    name: 'Soups & Stews', priceLabel: 'From ₦20,000', category: 'foodbowls', minGuests: null,
    icon: '🥘', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Buka Stew', 'Designer Stew', 'Goat Meat Stew', 'Cow Leg Stew', 'Cow Tail Stew', 'Fresh Crocker Fish Stew', 'Hake Fish Stew'],
  },
  {
    name: 'Traditional Soups', priceLabel: 'From ₦20,000', category: 'foodbowls', minGuests: null,
    icon: '🍲', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Efo Riro', 'Egusi', 'Seafood Okra', 'Ewedu', 'Gbegiri'],
  },
  {
    name: 'Pepper Soups', priceLabel: 'From ₦30,000', category: 'foodbowls', minGuests: null,
    icon: '🔥', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Goat Meat Pepper Soup', 'Turkey Pepper Soup', 'Catfish Pepper Soup'],
  },
  {
    name: 'Proteins', priceLabel: 'From ₦2,000', category: 'foodbowls', minGuests: null,
    icon: '🍗', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Chicken', 'Turkey', 'Beef', 'Goat Meat', 'Hake Fish', 'Crocker Fish', 'Gizzard', 'Snail'],
  },
  {
    name: 'Sides', priceLabel: 'From ₦1,000', category: 'foodbowls', minGuests: null,
    icon: '🥗', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Moi Moi', 'Plantain', 'Salad'],
  },
  {
    name: 'Swallows', priceLabel: 'From ₦1,000', category: 'foodbowls', minGuests: null,
    icon: '🍠', ribbon: '', ribbonGold: false, featured: false,
    inclusions: ['Pounded Yam', 'Poundo', 'Semo', 'Amala'],
  },
  {
    name: 'Takeaway Packs', priceLabel: '₦6,000+', category: 'foodbowls', minGuests: null,
    icon: '🥡', ribbon: 'Quick Meal', ribbonGold: false, featured: true,
    inclusions: ['Jollof Rice + Chicken', 'Jollof Rice + Chicken + Fish', 'Jollof/Fried Rice + Chicken', 'Jollof/Fried Rice + Chicken + Fish', 'Jollof Rice + Turkey', 'Jollof/Fried Rice + Turkey'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const ops = packages.map((pkg) => ({
      updateOne: {
        filter: { name: pkg.name, category: pkg.category },
        update: { $set: pkg },
        upsert: true,
      },
    }));

    const result = await CateringPackage.bulkWrite(ops);
    console.log(`✅ Seeded catering packages — upserted: ${result.upsertedCount}, matched: ${result.matchedCount}`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
