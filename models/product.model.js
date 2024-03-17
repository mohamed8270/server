const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    url: {type: String, required: true, unique: true},
    currency: {type: String, required: true},
    image: {type: String, required: true},
    title: {type: String, required: true},
    currentPrice: {type: Number, required: true},
    originalPrice: {type: Number, required: true},
    priceHistory: [
        {
            prices: {type: Number, required: true},
            Date: {type: Date, default: Date.now},
        },
    ],
    lowestPrice: {type: Number},
    highestPrice: {type: Number},
    averagePrice: {type: Number},
    discoutPercentage: {type: Number},
    description: {type: String},
    category: {type: String},
    reviewsCount: {type: Number},
    brand: {type: String},
    isOutOfStock: {type: String},
    users: [
        {
            email: {type: String, required: true},
        },
    ], default: [],
},
{timestamps: true}
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;