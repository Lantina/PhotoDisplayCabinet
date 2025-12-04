const fs = require('fs');
const path = require('path');
const exifr = require('exifr');
const sharp = require('sharp');
const photoService = require('../services/photoService');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

// 生成缩略图
const generateThumbnail = async (inputPath, outputPath, width = 400) => {
  try {
    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('[Thumbnail] 生成失败:', error.message);
    return null;
  }
};

// 获取图片尺寸
const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    console.error('[Image] 获取尺寸失败:', error.message);
    return { width: null, height: null };
  }
};

const getPhotos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    // 获取总数
    const { pool } = require('../config/db');
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM photos');
    const total = countResult[0].total;

    // 获取分页数据
    const [rows] = await pool.query(
      'SELECT * FROM photos ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    const photos = rows.map(photoService.mapRowToPhoto);

    res.json({
      data: photos,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

const formatExposureTime = (value) => {
  if (!value) return '';
  if (typeof value === 'number') {
    if (value >= 1) return `${value}s`;
    const denominator = Math.round(1 / value);
    return denominator ? `1/${denominator}` : `${value}s`;
  }
  const { numerator, denominator } = value;
  if (numerator && denominator) {
    return `${numerator}/${denominator}s`;
  }
  return `${value}`;
};

const formatAperture = (value) => {
  if (!value) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `f/${Number(num).toFixed(1).replace(/\.0$/, '')}`;
};

const formatFocalLength = (value) => {
  if (!value) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${num}mm`;
};

const extractExif = async (filePath) => {
  try {
    const data = await exifr.parse(filePath, {
      extract: [
        'Make',
        'Model',
        'DateTimeOriginal',
        'ModifyDate',
        'ExposureTime',
        'FNumber',
        'ISO',
        'FocalLength',
      ]
    });
    if (!data) return {};
    return {
      manufacturer: data.Make || '',
      model: data.Model || '',
      takenAt: data.DateTimeOriginal || null,
      modifiedAt: data.ModifyDate || null,
      exposureTime: formatExposureTime(data.ExposureTime),
      aperture: formatAperture(data.FNumber),
      iso: data.ISO ? String(data.ISO) : '',
      focalLength: formatFocalLength(data.FocalLength),
    };
  } catch (error) {
    console.warn('[EXIF] 解析失败:', error.message);
    return {};
  }
};

const clampRating = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(7, Math.max(0, Math.round(num)));
};

const createPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传照片文件' });
    }

    ensureUploadsDir();
    const metadata = req.body;
    const exif = await extractExif(req.file.path);

    // 获取图片真实尺寸
    const dimensions = await getImageDimensions(req.file.path);

    // 生成缩略图
    const thumbnailFileName = `thumb-${req.file.filename}`;
    const thumbnailPath = path.join(uploadsDir, thumbnailFileName);
    const thumbnailGenerated = await generateThumbnail(req.file.path, thumbnailPath);

    // 确定上传者身份（管理员或普通用户）
    const uploader = req.user?.username || 'anonymous';
    const userType = req.user?.type || 'admin'; // 'admin' 或 'user'

    const record = await photoService.insertPhoto({
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: metadata.title || '',
      description: metadata.description || '',
      camera: metadata.camera || '',
      lens: metadata.lens || '',
      shotAt: metadata.shotAt || '',
      location: metadata.location || '',
      width: dimensions.width || (metadata.width ? Number(metadata.width) : null),
      height: dimensions.height || (metadata.height ? Number(metadata.height) : null),
      dominantColor: metadata.dominantColor || '',
      fileSize: req.file.size,
      createdBy: uploader,
      manufacturer: metadata.manufacturer || exif.manufacturer || '',
      model: metadata.model || exif.model || '',
      takenAt: metadata.takenAt || exif.takenAt || null,
      exposureTime: metadata.exposureTime || exif.exposureTime || '',
      aperture: metadata.aperture || exif.aperture || '',
      iso: metadata.iso || exif.iso || '',
      modifiedAt: metadata.modifiedAt || exif.modifiedAt || null,
      focalLength: metadata.focalLength || exif.focalLength || '',
      rating: clampRating(metadata.rating),
    });

    // 添加缩略图信息到返回数据
    const result = {
      ...record,
      hasThumbnail: thumbnailGenerated !== null,
      thumbnailUrl: thumbnailGenerated ? `/uploads/${thumbnailFileName}` : null,
      uploadedBy: userType, // 返回上传者类型
    };

    res.status(201).json({
      data: result,
      message: userType === 'user' ? '照片上传成功，等待管理员审核' : '照片上传成功'
    });
  } catch (error) {
    next(error);
  }
};

const getPhotoById = async (req, res, next) => {
  try {
    const photo = await photoService.getPhotoById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: '照片不存在' });
    }
    res.json(photo);
  } catch (error) {
    next(error);
  }
};

const removePhoto = async (req, res, next) => {
  try {
    const photo = await photoService.getPhotoById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: '照片不存在' });
    }
    await photoService.deletePhoto(photo.id);

    // 删除原图
    const filePath = path.join(uploadsDir, photo.filename);
    fs.promises
      .unlink(filePath)
      .catch(() => {});

    // 删除缩略图
    const thumbnailFileName = `thumb-${photo.filename}`;
    const thumbnailPath = path.join(uploadsDir, thumbnailFileName);
    fs.promises
      .unlink(thumbnailPath)
      .catch(() => {});

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPhotos,
  createPhoto,
  removePhoto,
  getPhotoById,
};

