const Product = require('../models/products');
const Review = require("../models/Review");

const asyncHandler = require('express-async-handler');


/**
 * @desc   (search) get all products
 * @route   GET /api/products
 * @access  عام
 */

exports.getAllProducts = asyncHandler(async (req, res) => {
    const { search, price, category } = req.query;
    if (!search && !price && !category) {
        return res.status(400).json({ message: 'Please provide at least one search parameter' });
    }
    const query= {};
    if (search) {
        query.$or = [
          { name:     { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
    }
    if (price) {
        const maxPrice = parseFloat(price);
        if (isNaN(maxPrice)) {
          return res.status(400).json({ message: 'قيمة price غير صالحة' });
        }
        query.price = { $gte: 0, $lte: maxPrice };
      }
      
    if (category) {
        query.category = category;
    }
    query.stockQuantity = { $gt: 0 };

    const products = await Product.find(query);
    res.status(200).json(products);
});



/**
 * @desc    get one product by id
 * @route   GET /api/products/:id
 * @access  عام
 */

exports.getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
});

/**
 * @desc   get all reviews for a product by id
 * @route   GET /api/products/:id/reviews
 * @access  عام
 */
exports.getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.id })
        .populate('user', 'name email');
    if (!reviews.length) {
        return res.status(404).json({ message: 'No reviews found for this product' });
    }
    res.status(200).json(reviews);
});