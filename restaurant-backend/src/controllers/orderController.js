const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const TAX_RATE = 0.075; // 7.5%

// GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, type, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, type, tableNumber, customerName, customerPhone, deliveryAddress, notes } = req.body;

    // Validate and price items from DB (never trust client prices)
    const resolvedItems = await Promise.all(
      items.map(async ({ menuItem, quantity, notes: itemNotes }) => {
        const dbItem = await MenuItem.findById(menuItem);
        if (!dbItem) throw Object.assign(new Error(`Menu item ${menuItem} not found`), { status: 404 });
        if (!dbItem.available) throw Object.assign(new Error(`${dbItem.name} is currently unavailable`), { status: 400 });

        return {
          menuItem: dbItem._id,
          name: dbItem.name,
          price: dbItem.price,
          quantity,
          notes: itemNotes || '',
        };
      })
    );

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const order = await Order.create({
      items: resolvedItems,
      type,
      tableNumber: tableNumber || null,
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || '',
      subtotal,
      tax,
      total,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id  (cancel only — no hard deletes)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/stats  — daily summary
exports.getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [stats] = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const byStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        today: stats || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      },
    });
  } catch (err) {
    next(err);
  }
};
