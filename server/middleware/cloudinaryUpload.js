const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');

// ─── Cloudinary config ────────────────────────────────────────────────────
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Configured — avatars will be stored in the cloud.');
} else {
  console.warn(
    '[Cloudinary] Missing env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). ' +
    'Falling back to local disk storage — avatars will not persist across server restarts.'
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
}

// ─── Local-disk fallback (mirrors the original uploadMiddleware) ────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, 'avatar-' + Date.now() + path.extname(file.originalname)),
});

const diskUpload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// ─── Memory upload for Cloudinary path ───────────────────────────────────
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// ─── Exported middleware ──────────────────────────────────────────────────
/**
 * avatarUpload — drops-in where upload.single('avatar') was used.
 *
 * When Cloudinary is configured:
 *   • Stores the image on Cloudinary under the `elevatex/avatars` folder.
 *   • Sets req.file.cloudinaryUrl to the secure HTTPS URL.
 *
 * When Cloudinary is NOT configured:
 *   • Falls back to saving the file on local disk (original behaviour).
 *   • req.file.cloudinaryUrl is undefined; use req.file.filename instead.
 */
const avatarUpload = cloudinaryConfigured
  ? [
      memUpload.single('avatar'),
      async (req, res, next) => {
        if (!req.file) return next();
        try {
          const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder: 'elevatex/avatars',
            resource_type: 'image',
            // Overwrite the same public_id per user so old images are replaced
            public_id: `user_${req.user?._id || Date.now()}`,
            overwrite: true,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          });
          req.file.cloudinaryUrl = result.secure_url;
          next();
        } catch (err) {
          console.error('[Cloudinary] Upload failed:', err.message);
          next(err);
        }
      },
    ]
  : [diskUpload.single('avatar')];

module.exports = { avatarUpload };
