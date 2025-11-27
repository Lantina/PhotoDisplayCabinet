const fs = require('fs');
const path = require('path');
const exifr = require('exifr');
const photoService = require('../services/photoService');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const getPhotos = async (req, res, next) => {
  try {
    const photos = await photoService.listPhotos();
    res.json({ data: photos });
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
    const data = await exifr.parse(filePath, [
      'Make',
      'Model',
      'DateTimeOriginal',
      'ModifyDate',
      'ExposureTime',
      'FNumber',
      'ISO',
      'FocalLength',
    ]);
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

    const record = await photoService.insertPhoto({
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: metadata.title || '',
      description: metadata.description || '',
      camera: metadata.camera || '',
      lens: metadata.lens || '',
      shotAt: metadata.shotAt || '',
      location: metadata.location || '',
      width: metadata.width ? Number(metadata.width) : null,
      height: metadata.height ? Number(metadata.height) : null,
      dominantColor: metadata.dominantColor || '',
      fileSize: req.file.size,
      createdBy: req.user?.username || 'admin',
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

    res.status(201).json({ data: record });
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
    const filePath = path.join(uploadsDir, photo.filename);
    fs.promises
      .unlink(filePath)
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
};

