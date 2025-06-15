const multer = require('multer');
const sharp = require('sharp');
const zlib = require('zlib');
const streamifier = require('streamifier');
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg'); // لازم تنزله: npm i fluent-ffmpeg

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB حد أقصى لكل ملف
  }
});

// ✅ ضغط باستخدام Stream
function gzipStreamBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const input = streamifier.createReadStream(buffer);
    const output = new PassThrough();
    const chunks = [];

    output.on('data', (chunk) => chunks.push(chunk));
    output.on('end', () => resolve(Buffer.concat(chunks)));
    output.on('error', reject);

    input.pipe(gzip).pipe(output);
  });
}

// ✅ ضغط فيديو أو صوت باستخدام ffmpeg (تنزيل جودة)
function compressMedia(buffer, type) {
  return new Promise((resolve, reject) => {
    const inputStream = streamifier.createReadStream(buffer);
    const outputChunks = [];
    const outputStream = new PassThrough();

    outputStream.on('data', (chunk) => outputChunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(outputChunks)));
    outputStream.on('error', reject);

    let command = ffmpeg(inputStream).format(type);

    if (type === 'mp4') {
      command = command.videoBitrate('500k').size('?x480');
    } else if (type === 'mp3') {
      command = command.audioBitrate('96k');
    }

    command.on('error', reject).pipe(outputStream, { end: true });
  });
}

async function optimizeAndPrepare(req, res, next) {
  if (!req.files || !Array.isArray(req.files)) return next();

  try {
    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        let buffer = file.buffer;

        if (file.mimetype.startsWith('image/')) {
          // ✅ ضغط وتحسين الصور
          buffer = await sharp(buffer)
            .resize({ width: 800, withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toBuffer();

        } else if (file.mimetype.startsWith('video/')) {
          // ✅ تقليل جودة الفيديو
          buffer = await compressMedia(buffer, 'mp4');

        } else if (file.mimetype.startsWith('audio/')) {
          // ✅ تقليل جودة الصوت
          buffer = await compressMedia(buffer, 'mp3');

        } else {
          // ✅ ملفات عادية مثل PDF, DOCX, ZIP ...الخ
          // لا تغيير، فقط ضغط لاحقًا
        }

        // ✅ ضغط كل الملفات بعد التحسين
        const gzippedBuffer = await gzipStreamBuffer(buffer);
        file.buffer = gzippedBuffer;
        file.mimetype = 'application/gzip';
        file.originalname += '.gz';

        return file;
      })
    );

    req.files = processedFiles;
    next();
  } catch (err) {
    console.error('خطأ في المعالجة:', err.message)
    res.status(500).json({ error: 'فشل في معالجة الملفات' })
    next(err) ;
  }
}

module.exports = { upload, optimizeAndPrepare };