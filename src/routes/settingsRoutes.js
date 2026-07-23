const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const Settings = require('../models/Settings');

// GET /api/settings — public, the order page needs this to know the plate limit
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'site-settings' });
    if (!settings) {
      // First time ever — create the default row
      settings = await Settings.create({ key: 'site-settings', maxPortionsPerPlate: 4 });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load settings' });
  }
});

// PUT /api/settings — admin only, updates maxPortionsPerPlate
router.put('/', requireAuth, async (req, res) => {
  try {
    const { maxPortionsPerPlate } = req.body;
    if (!maxPortionsPerPlate || maxPortionsPerPlate < 1) {
      return res.status(400).json({ success: false, message: 'maxPortionsPerPlate must be at least 1' });
    }
    const settings = await Settings.findOneAndUpdate(
      { key: 'site-settings' },
      { maxPortionsPerPlate },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update settings' });
  }
});

module.exports = router;
