var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const content = require("./config/conectet");
const securityMiddleware = require('./middlewares/securityMiddleware');
const { errorNotFound, errorHandler } = require('./middlewares/error');
require("dotenv").config();
const cors = require('cors');



var usersRouter = require('./routes/users');
var forgetpasswordRouter = require('./routes/forgetpass');
var productMerchantRouter = require('./routes/productMerchant');
var productUserRouter = require('./routes/productUserRoutes');
var categoryRouter = require('./routes/categoryRoutes');
var ordersRouter = require('./routes/orders');
var shippingCompanyRouter = require('./routes/Shipping-company');
var reviewRouter = require('./routes/reviewRoutes');
var adminRouter = require('./routes/admin');


var app = express();

content();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'auth-token'],
  exposedHeaders: ['auth-token']
}));

const compression = require("compression")
app.use(compression())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(securityMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/forgetpassword', forgetpasswordRouter);
app.use('/productMerchant', productMerchantRouter);
app.use('/productUser', productUserRouter);
app.use('/category', categoryRouter);
app.use('/orders', ordersRouter);
app.use('/shippingCompany', shippingCompanyRouter);
app.use('/review', reviewRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(errorNotFound);

// error handler
app.use(errorHandler);


module.exports = app;
