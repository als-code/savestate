const path = require('path');
const multer = require('multer');
const { AppError } = require('../errors/AppError');

function safeExt(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  if (!allowed.has(ext)) return null;
  return ext;
}

const storage = multer.diskStorage({
  destination: function destination(_req, _file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function filename(_req, file, cb) {
    const ext = safeExt(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `cover-${unique}${ext || ''}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = safeExt(file.originalname);
  if (!ext) return cb(new AppError('Archivo inválido: solo jpg/jpeg/png/webp', 400));
  return cb(null, true);
}

const uploadCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadCover };

