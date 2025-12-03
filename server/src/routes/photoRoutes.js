const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const photoController = require('../controllers/photoController');
const { authenticate, authenticateToken } = require('../middleware/authMiddleware');

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
    fileSize: 20 * 1024 * 1024, // 20MB
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

// 通用认证中间件 - 支持管理员和普通用户
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '请先登录' });
  }

  const token = authHeader.replace('Bearer ', '');
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'pdcabinet-secret';

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

// 管理员专属中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

router.get('/', photoController.getPhotos);
router.get('/:id', photoController.getPhotoById);
router.post('/', requireAuth, upload.single('photo'), photoController.createPhoto);
router.delete('/:id', requireAuth, requireAdmin, photoController.removePhoto);

module.exports = router;

