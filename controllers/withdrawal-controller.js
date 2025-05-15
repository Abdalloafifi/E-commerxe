// controllers/withdrawal.controller.js
const asyncHandler = require('express-async-handler');
const Auth = require('../models/auth');
const Withdrawal = require('../models/withdrawal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc   طلب سحب الأموال
 * @route  POST /api/withdraw
 * @method POST
 */
exports.requestWithdrawal = [
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const user = await Auth.findById(req.user._id);

    if (user.money < amount) {
      return res.status(400).json({ message: 'رصيدك غير كافي' });
    }

    if (!user.stripeAccountId) {
      return res.status(400).json({ message: 'يرجى ربط حساب Stripe أولاً' });
    }

    user.money -= amount;
    await user.save();

    try {
      const transfer = await stripe.transfers.create({
        amount: amount * 100, 
        currency: 'usd',
        destination: user.stripeAccountId,
      });

      const withdrawal = await Withdrawal.create({
        user: user._id,
        amount,
        status: 'completed',
        stripeTransactionId: transfer.id,
      });

      res.status(201).json({
        message: 'تمت عملية السحب بنجاح',
        withdrawal,
      });

    } catch (error) {
      user.money += amount;
      await user.save();

      res.status(500).json({
        message: 'فشلت عملية السحب',
        error: error.message,
      });
    }
  })
];