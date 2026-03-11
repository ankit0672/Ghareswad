const Order = require('../models/Order');
const Dish = require('../models/Dish');

// POST /api/orders  (customer only)
const placeOrder = async (req, res) => {
    try {
        const { items, deliveryAddress } = req.body;
        // items: [{ dishId, qty }]

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Fetch dish details and group by chef
        const dishIds = items.map((i) => i.dishId);
        const dishes = await Dish.find({ _id: { $in: dishIds }, isAvailable: true });

        if (dishes.length === 0) {
            return res.status(400).json({ message: 'No valid dishes found' });
        }

        // Group items by chef (one order per chef)
        const chefMap = {};
        for (const item of items) {
            const dish = dishes.find((d) => d._id.toString() === item.dishId);
            if (!dish) continue;
            const cid = dish.chefId.toString();
            if (!chefMap[cid]) {
                chefMap[cid] = { chefId: dish.chefId, chefName: dish.chefName, items: [] };
            }
            chefMap[cid].items.push({
                dish: dish._id,
                dishName: dish.name,
                dishPhoto: dish.photo,
                qty: item.qty,
                price: dish.price,
            });
        }

        const orders = [];
        for (const cid of Object.keys(chefMap)) {
            const { chefId, chefName, items: orderItems } = chefMap[cid];
            const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
            const order = await Order.create({
                customerId: req.user._id,
                customerName: req.user.name,
                chefId,
                chefName,
                items: orderItems,
                totalAmount,
                deliveryAddress: deliveryAddress || req.user.location || '',
            });
            orders.push(order);
        }

        res.status(201).json({ message: 'Order placed successfully', orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/orders/my  (customer)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/orders/chef  (chef)
const getChefOrders = async (req, res) => {
    try {
        const orders = await Order.find({ chefId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/orders/chef/stats  (chef)
const getChefStats = async (req, res) => {
    try {
        const orders = await Order.find({ chefId: req.user._id });
        const totalOrders = orders.length;
        const totalEarnings = orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

        res.json({ totalOrders, totalEarnings, pendingOrders, deliveredOrders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/orders/:id/status  (chef)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'accepted', 'preparing', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, chefId: req.user._id },
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { placeOrder, getMyOrders, getChefOrders, getChefStats, updateOrderStatus };
