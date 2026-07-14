// seedMenu.js
// Bulk-inserts the restaurant's menu into MongoDB.
// Run with: node seedMenu.js

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

const menuItems = [
  // STAPLES / SWALLOW
  { name: 'Amala', price: 300, category: 'sides', description: 'Traditional yam flour swallow' },
  { name: 'Eba', price: 300, category: 'sides', description: 'Garri swallow' },
  { name: 'Semo', price: 300, category: 'sides', description: 'Semolina swallow' },
  { name: 'Poundo', price: 300, category: 'sides', description: 'Pounded yam (poundo)' },
  { name: 'Fufu', price: 300, category: 'sides', description: 'Fermented cassava swallow' },

  // MEALS
  { name: 'Jollof Rice', price: 1200, category: 'mains', description: 'Per portion' },
  { name: 'Fried Rice', price: 1500, category: 'mains', description: 'Per portion' },
  { name: 'Asun Rice', price: 2000, category: 'mains', description: 'Per portion' },
  { name: 'White Rice', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Village Rice', price: 2000, category: 'mains', description: 'Per portion' },
  { name: 'Ofada Rice', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Stirfry Spaghetti', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Special Spaghetti', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Yam Porridge', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'White Yam', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Yamarita', price: 1000, category: 'mains', description: 'Per portion' },
  { name: 'Ewa Agoyin', price: 800, category: 'mains', description: 'Per portion' },

  // PROTEIN
  { name: 'Ponmo', price: 300, category: 'specials', description: 'Protein add-on' },
  { name: 'Egg', price: 400, category: 'specials', description: 'Protein add-on' },
  { name: 'Assorted', price: 200, category: 'specials', description: 'Protein add-on' },
  { name: 'Beef', price: 500, category: 'specials', description: 'Protein add-on' },
  { name: 'Turkey', price: 3000, category: 'specials', description: 'Price varies ₦3,000–₦4,000 depending on size' },
  { name: 'Chicken', price: 2500, category: 'specials', description: 'Price varies ₦2,500–₦4,000 depending on size' },
  { name: 'Peppered Snails', price: 2500, category: 'specials', description: 'Protein add-on' },
  { name: 'Gizzard', price: 1500, category: 'specials', description: 'Protein add-on' },
  { name: 'Panla Fish', price: 2000, category: 'specials', description: 'Price varies ₦2,000–₦4,000 depending on size' },
  { name: 'Smoked Panla', price: 400, category: 'specials', description: 'Protein add-on' },
  { name: 'Croaker Fish', price: 3000, category: 'specials', description: 'Price varies ₦3,000–₦4,000 depending on size' },
  { name: 'Titus Fish', price: 1000, category: 'specials', description: 'Protein add-on' },
  { name: 'Ogunfe', price: 2000, category: 'specials', description: 'Protein add-on' },
  { name: 'Catfish', price: 2000, category: 'specials', description: 'Price varies ₦2,000–₦3,000 depending on size' },

  // EXTRA
  { name: 'Moi-Moi', price: 500, category: 'sides', description: 'Steamed bean pudding' },
  { name: 'Plantain', price: 500, category: 'sides', description: 'Fried plantain' },
  { name: 'Salad', price: 500, category: 'sides', description: '' },

  // SOUPS/STEWS
  { name: 'Egusi', price: 500, category: 'mains', description: 'Melon seed soup' },
  { name: 'Efo Riro', price: 500, category: 'mains', description: 'Vegetable stew' },
  { name: 'Ewedu', price: 0, category: 'mains', description: 'Only available as a side for Amala' },
  { name: 'Gbegiri', price: 0, category: 'mains', description: 'Only available as a side for Amala' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const item of menuItems) {
      const exists = await MenuItem.findOne({ name: item.name });
      if (exists) {
        console.log(`⏭️  Skipped (already exists): ${item.name}`);
        skipped++;
        continue;
      }
      await MenuItem.create(item);
      console.log(`✅ Added: ${item.name}`);
      created++;
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Total in list: ${menuItems.length}`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
