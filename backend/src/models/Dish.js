const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Dish name is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        photo: {
            type: String, // relative path from uploads/
            required: [true, 'Dish photo is required'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        chefId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        chefName: {
            type: String,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        category: {
            type: String,
            default: 'Home Cooked',
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Dish', dishSchema);
