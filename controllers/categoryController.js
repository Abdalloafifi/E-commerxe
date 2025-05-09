const category  = require('../models/category');
const asyncHandler = require('express-async-handler');
const xss = require("xss");
const Joi = require('joi');

const admin =(req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  }

/**
 * @desc create new category
 * @route /api/categories
 * @method Post
 * @access private
 * @access admin
 */

exports.createCategory =[admin, asyncHandler(async (req, res) => {
    try {
        const data = {
            name: xss(req.body.name),

        }
        const { error } = vildateCategory(data);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newCategory = new category({
            name: data.name,
            user: req.user.id
        });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", data: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
})];

function vildateCategory(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
    });
    return schema.validate(data);
}

/**
 * @desc get all categories
 * @route /api/categories/all
 * @method get
 * @access public
 */

exports.getCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});