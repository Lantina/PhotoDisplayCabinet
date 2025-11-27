const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const photoController = require('../controllers/photoController');
const { authenticate } = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片文件'));
    }
  },
});

const router = express.Router();

router.get('/', photoController.getPhotos);
router.post('/', authenticate, upload.single('photo'), photoController.createPhoto);
router.delete('/:id', authenticate, photoController.removePhoto);

module.exports = router;

