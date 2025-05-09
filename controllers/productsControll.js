const Product = require('../models/products');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const xss = require('xss');
const Joi = require('joi');
const cloudinary = require("../config/cloudinary"); 


const merchant=(req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}
exports.addProduct = [ merchant,asyncHandler(async (req, res) => {
    const data = {
        name: xss(req.body.name),
        description: xss(req.body.description),
        price: xss(req.body.price),
        category: xss(req.body.category),
        stockQuantity: xss(req.body.stockQuantity),
        Address: xss(req.body.Address),

    };
    const error = valiAddProduct(data);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }
    const category = await Category.findOne({ _id: data.category });
    if (!category) {
        res.status(400).json({ message: 'Category not found' });
        return;
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'يجب رفع ملف واحد على الأقل' });
    }


    const cloudinaryFolder = `users/${req.user._id}/products`;
    const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: cloudinaryFolder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ فشل رفع الملف:', error);
                        return reject(new Error(`فشل رفع الملف: ${file.originalname}`));
                    }
                    resolve(result.secure_url);
                }
            ).end(file.buffer);
        });
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    // 5. تحديث البيانات في MongoDB
    const product = await Product.create({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stockQuantity: data.stockQuantity,
        imageUrl: uploadedUrls,
        user: req.user._id,
        Address: data.Address,  
    });
    res.status(201).json({ message: 'تم إضافة المنتج بنجاح' }); 

})];
function valiAddProduct(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        category: Joi.string().required(),
        stockQuantity: Joi.number().required(),
        Address: Joi.string().required(),
    });
    return schema.validate(data);
}
exports.updateProduct = [ merchant,asyncHandler(async (req, res) => {
    const data = {
        name: xss(req.body.name),
        description: xss(req.body.description),
        price: xss(req.body.price),
        category: xss(req.body.category),
        stockQuantity: xss(req.body.stockQuantity),
    };
    const error = valiUpdateProduct(data);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }
    const category = await Category.findOne({ _id: data.category });
    if (!category) {
        res.status(400).json({ message: 'Category not found' });
        return;
    }
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
        res.status(400).json({ message: 'Product not found' });
        return;
    }
    if (product.author.toString() !== req.user._id.toString()) {
        res.status(400).json({ message: 'You are not the author of this product' });
        return;
    }
    await Product.updateOne({ _id: req.params.id }, {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stockQuantity: data.stockQuantity,
        imageUrl: data.image,
    });
    res.status(201).json({ message: 'Product updated successfully' });
})];
  
function valiUpdateProduct(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        category: Joi.string().required(),
        stockQuantity: Joi.number().required(),
    });
    return schema.validate(data);
}
exports.deleteProduct = [ merchant,asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
        res.status(400).json({ message: 'Product not found' });
        return;
    }
    if (product.author.toString() !== req.user._id.toString()) {
        res.status(400).json({ message: 'You are not the author of this product' });
        return;
    }
    // Delete imageUrl from Cloudinary
    const publicIds = product.imageUrl.map((url) => url.split('/').pop().split('.')[0]);
    const deletePromises = publicIds.map((publicId) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    return reject(new Error(`فشل حذف الصورة: ${publicId}`));
                }
                resolve(result);
            });
        });
    });
    await Promise.all(deletePromises);
    await Product.deleteOne({ _id: req.params.id });
    res.status(201).json({ message: 'Product deleted successfully' });
})];

exports.getAllProductsMerchant = [merchant,asyncHandler(async (req, res) => {
    const products = await Product.find({author: req.user._id});
    res.json(products);
})];

