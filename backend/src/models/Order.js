const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        required: true,
    },
    dishName: String,
    dishPhoto: String,
    qty: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customerName: String,
        chefId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        chefName: String,
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryAddress: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'preparing', 'delivered', 'cancelled'],
            default: 'pending',
        },
        cancellationReason: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
