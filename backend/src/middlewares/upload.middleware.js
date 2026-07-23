const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/apiError.util');

// ─── Allowed MIME Types ──────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

// ─── File Filter Factory ─────────────────────────────────────────────────────
const createFileFilter = (allowedTypes) => (_req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

// ─── Disk Storage ────────────────────────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// ─── Upload Configurations ────────────────────────────────────────────────────
const uploadImage = multer({
  storage: diskStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES)
});

const uploadDocument = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES)
});

// ─── Multer Error Handler ─────────────────────────────────────────────────────
const handleMulterError = (err, _req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size exceeds the allowed limit.', 'FILE_TOO_LARGE'));
    }
    return next(new ApiError(400, err.message, 'UPLOAD_ERROR'));
  }
  next(err);
};

module.exports = { uploadImage, uploadDocument, handleMulterError };
