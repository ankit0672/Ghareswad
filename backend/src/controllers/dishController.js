const Dish = require('../models/Dish');
const path = require('path');

// POST /api/dishes  (chef only)
const uploadDish = async (req, res) => {
    try {
        const { name, price, location, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Dish photo is required' });
        }
        if (!name || !price || !location) {
            return res.status(400).json({ message: 'Name, price and location are required' });
        }

        const dish = await Dish.create({
            name,
            price: parseFloat(price),
            location,
            description: description || '',
            category: category || 'Home Cooked',
            photo: req.file.filename,
            chefId: req.user._id,
            chefName: req.user.name,
        });

        res.status(201).json(dish);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/dishes  (public)
const getAllDishes = async (req, res) => {
    try {
        const { location, search } = req.query;
        let filter = { isAvailable: true };

        if (location && location !== 'All') {
            filter.location = { $regex: location, $options: 'i' };
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const dishes = await Dish.find(filter).sort({ createdAt: -1 });
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/dishes/my  (chef only)
const getMyDishes = async (req, res) => {
    try {
        const dishes = await Dish.find({ chefId: req.user._id }).sort({ createdAt: -1 });
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/dishes/:id/toggle  (chef only)
const toggleAvailability = async (req, res) => {
    try {
        const dish = await Dish.findOne({ _id: req.params.id, chefId: req.user._id });
        if (!dish) return res.status(404).json({ message: 'Dish not found' });

        dish.isAvailable = !dish.isAvailable;
        await dish.save();
        res.json(dish);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/dishes/:id  (chef only)
const deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findOneAndDelete({ _id: req.params.id, chefId: req.user._id });
        if (!dish) return res.status(404).json({ message: 'Dish not found' });
        res.json({ message: 'Dish deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { uploadDish, getAllDishes, getMyDishes, toggleAvailability, deleteDish };
