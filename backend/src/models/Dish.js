const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stars:    { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now },
});

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
            type: String,
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
        ratings: [ratingSchema],
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

dishSchema.virtual('avgRating').get(function () {
    if (!this.ratings || this.ratings.length === 0) return 0;
    return +(this.ratings.reduce((s, r) => s + r.stars, 0) / this.ratings.length).toFixed(1);
});

dishSchema.virtual('ratingCount').get(function () {
    return this.ratings ? this.ratings.length : 0;
});

module.exports = mongoose.model('Dish', dishSchema);
