const MenuItem = require('../models/MenuItem');

// GET /api/menu
exports.getAllItems = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/menu/:id
exports.getItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// POST /api/menu
exports.createItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menu/:id
exports.updateItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menu/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/menu/:id/availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

    item.available = !item.available;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};
