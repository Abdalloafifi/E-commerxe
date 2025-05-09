const mongoose = require('mongoose');
const { Schema } = mongoose;
const categorySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    name: {
        type: String,
        required: true,
    },

}, {
    timestamps: true,
});
module.exports = mongoose.model('Category', categorySchema);