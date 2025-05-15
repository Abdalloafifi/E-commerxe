const express = require('express');
const router = express.Router();
const {requestWithdrawal} = require('../controllers/withdrawal-controller');
const { verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifytoken');


router.post('/', verifyToken, requestWithdrawal);

module.exports = router;