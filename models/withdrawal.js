// models/withdrawal.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const withdrawalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  stripeTransactionId: String,
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);