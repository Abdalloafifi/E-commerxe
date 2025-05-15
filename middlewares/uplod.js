// const multer = require("multer");

// const storage = multer.memoryStorage(); // Store filess in memory
// const upload = multer({ storage });

// module.exports = upload; // Export the upload middleware
//or 
//npm i  sharp zlib
 
 
 const multer = require('multer');
 const sharp = require('sharp');
 const zlib = require('zlib');
 const { promisify } = require('util');
 const gzip = promisify(zlib.gzip);
 const storage = multer.memoryStorage();
 const upload = multer({ storage });
 
 
async function optimizeAndPrepare(req, res, next) {
  if (!req.files || !Array.isArray(req.files)) return next();

  const processedFiles = await Promise.all(req.files.map(async (file) => {
    let buffer = file.buffer;

    if (file.mimetype.startsWith('image/')) {
      try {
        buffer = await sharp(buffer)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (err) {
        throw new Error("فشل في معالجة الصورة");
      }
    }

    try {
      const gz = await gzip(buffer);
      file.buffer = gz;
      file.mimetype = 'application/gzip';
      file.originalname += '.gz';
    } catch (err) {
      throw new Error("فشل في ضغط الملف");
    }

    return file;
  }));

  req.files = processedFiles;

  next();
}
 module.exports = { upload, optimizeAndPrepare };
 
 