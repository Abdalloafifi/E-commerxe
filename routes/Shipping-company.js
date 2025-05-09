var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const { getShippedOrders , updateOrderStatus } = require("../controllers/Shipping-company.comtroller");


router.get('/shipped-orders', verifyToken, getShippedOrders);
router.put('/shipped-orders/:id', verifyToken, updateOrderStatus);


module.exports = router;
