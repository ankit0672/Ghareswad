const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};

const chefOnly = (req, res, next) => {
    if (req.user && req.user.role === 'chef') return next();
    return res.status(403).json({ message: 'Access restricted to chefs only' });
};

const customerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'customer') return next();
    return res.status(403).json({ message: 'Access restricted to customers only' });
};

module.exports = { protect, chefOnly, customerOnly };
