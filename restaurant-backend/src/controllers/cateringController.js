const CateringPackage = require('../models/CateringPackage');

// GET /api/catering
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await CateringPackage.find().sort({ category: 1, createdAt: 1 });
    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/catering/:id
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await CateringPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/catering
exports.createPackage = async (req, res) => {
  try {
    const pkg = await CateringPackage.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/catering/:id
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await CateringPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/catering/:id
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await CateringPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/catering/:id/availability
exports.toggleAvailability = async (req, res) => {
  try {
    const pkg = await CateringPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    pkg.available = !pkg.available;
    await pkg.save();
    res.json({ success: true, data: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
