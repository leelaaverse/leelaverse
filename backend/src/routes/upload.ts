import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { config } from '../config/config';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, config.UPLOAD_PATH);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const fileFilter = function (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

// @route   POST /api/upload/image
// @desc    Upload single image
// @access  Private
router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  return res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', authenticate, upload.array('images', 5), (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded',
    });
  }

  const files = req.files.map((file: Express.Multer.File) => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    url: `/uploads/${file.filename}`,
  }));

  return res.json({
    success: true,
    data: files,
  });
});

export default router;
