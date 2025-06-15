var express = require('express');
var path = require('path');
const content = require("./config/conectet");
const securityMiddleware = require('./middlewares/securityMiddleware');
const { errorNotFound, errorHandler } = require('./middlewares/error');
require("dotenv").config();
const cors = require('cors');
const session = require('express-session');





var usersRouter = require('./routes/users');
var forgetpasswordRouter = require('./routes/forgetpass');
var productMerchantRouter = require('./routes/productMerchant');
var productUserRouter = require('./routes/productUserRoutes');
var categoryRouter = require('./routes/categoryRoutes');
var ordersRouter = require('./routes/orders');
var shippingCompanyRouter = require('./routes/Shipping-company');
var reviewRouter = require('./routes/reviewRoutes');
var adminRouter = require('./routes/admin');
var withdrawal = require('./routes/withdrawal');


var app = express();
securityMiddleware(app)


content();

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token', 'X-CSRF-Token'],
    exposedHeaders: ['auth-token'],
  credentials: true 
    
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'سر-قوي-هنا',
  resave: true,
  saveUninitialized: true
}));


app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/forgetpassword', forgetpasswordRouter);
app.use('/productMerchant', productMerchantRouter);
app.use('/productUser', productUserRouter);
app.use('/category', categoryRouter);
app.use('/admin', adminRouter);
app.use('/review', reviewRouter);
app.use('/orders', ordersRouter);
app.use('/shippingCompany', shippingCompanyRouter);
app.use('/withdrawal', withdrawal);

// catch 404 and forward to error handler
app.use(errorNotFound);

// error handler
app.use(errorHandler);


module.exports = app;
