const mongoose = require('mongoose');
const { Schema } = mongoose;

const authSchema = new Schema({
    role: {
        type: String,
        enum: ['admin', 'user', 'merchant', 'Shipping-company'],
        required: true,
        default: 'user',
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordCode: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: Number,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
        default: "https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg", // رابط الصورة الافتراضية
    },
    Address: {
        type: String,

    },
    PersonalPhoto: [{
        type: String,
    }],
    ChangePersonalPhoto: {
        type: Boolean,
        default: false,
    },
    money: {
        type: Number,
        default: 0,
    },
    stripeAccountId: {
        type: String,
        default: null
    },
}, { timestamps: true }
);

module.exports = mongoose.model('Auth', authSchema);