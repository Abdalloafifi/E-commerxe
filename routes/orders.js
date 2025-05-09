var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const { addToCart ,getCartItems ,removeFromCart ,checkout ,webhook ,getAllOrders ,cancelOrder } = require("../controllers/ordersControllers");

router.post('/add-to-cart', verifyToken, addToCart);
router.get('/cart-items', verifyToken, getCartItems);
router.delete('/remove-from-cart/:id', verifyToken, removeFromCart);
router.post('/checkout', verifyToken, checkout);
router.post('/webhook', webhook);
router.get('/all-orders', verifyToken, getAllOrders);
router.post('/cancel-order/:id', verifyToken, cancelOrder);



module.exports = router;
