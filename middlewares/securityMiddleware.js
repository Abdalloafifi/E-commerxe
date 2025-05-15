// npm install express helmet express-mongo-sanitize express-rate-limit hpp csurf cookie-parser cors xss-clean compression express-useragent morgan

const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const compression = require('compression');
const useragent = require('express-useragent');
const morgan = require('morgan');
const lusca = require('lusca');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'تم حظر الطلبات المفرطة مؤقتًا، حاول لاحقًا',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = (app) => {
  app.disable('x-powered-by');

  app.use(morgan('combined'));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Content-Type
app.use((req, res, next) => {
  const allowedTypes = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'];
  const contentType = req.headers['content-type']?.split(';')[0];
  if (req.method !== 'GET' && contentType && !allowedTypes.includes(contentType)) {
    return res.status(415).json({ message: 'نوع المحتوى مرفوض' });
  }
  next();
});

    app.use(helmet());
    app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));

    app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
}));

  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
      },
    })
  );

  app.use(helmet.frameguard({ action: 'deny' }));

  app.use(helmet.noSniff());

  app.use(xssClean());

  app.use(mongoSanitize());

  app.use(hpp());

  app.use(limiter);

 
// app.use(lusca({
//     csrf: {
//         cookie: 'csrf_token', 
//         header: 'X-CSRF-Token'
//     }
// }));

  // app.use((req, res, next) => {
  //   res.cookie('csrf_token', req.csrfToken(), {
  //     httpOnly: false,
  //     sameSite: 'Strict',
  //     secure: false,
  //   });
  //   next();
  // });



  app.use(compression());

  app.use(useragent.express());

  app.use((req, res, next) => {
    const allowedHosts = ['example.com', 'localhost'];
    if (!allowedHosts.includes(req.hostname)) {
      return res.status(403).json({ message: 'طلب غير مصرح به' });
    }
    next();
  });

  app.use((req, res, next) => {
    if (req.path.includes('..')) {
      return res.status(400).json({ message: 'مسار غير صالح' });
    }
    next();
  });

  app.use((req, res, next) => {
    if (req.headers['x-http-method-override']) {
      return res.status(405).json({ message: 'Method Override غير مسموح' });
    }
    next();
  });

  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'حدث خطأ بالسيرفر' });
  });

};
