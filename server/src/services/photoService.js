const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const mapRowToPhoto = (row) => {
  if (!row) return null;

  // 动态生成压缩图和缩略图的URL
  const compressedFileName = `compressed-${row.filename}`;
  const thumbnailFileName = `thumb-${row.filename}`;

  // 检查文件是否存在
  const compressedPath = path.join(uploadsDir, compressedFileName);
  const thumbnailPath = path.join(uploadsDir, thumbnailFileName);
  const hasCompressed = fs.existsSync(compressedPath);
  const hasThumbnail = fs.existsSync(thumbnailPath);

  // 调试日志
  console.log(`[mapRowToPhoto] 处理文件: ${row.filename}`);
  console.log(`[mapRowToPhoto] 压缩图路径: ${compressedPath}, 存在: ${hasCompressed}`);
  console.log(`[mapRowToPhoto] 缩略图路径: ${thumbnailPath}, 存在: ${hasThumbnail}`);

  const result = {
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    title: row.title,
    description: row.description,
    camera: row.camera,
    lens: row.lens,
    shotAt: row.shot_at ? row.shot_at.toISOString() : null,
    location: row.location,
    width: row.width,
    height: row.height,
    dominantColor: row.dominant_color,
    fileSize: row.file_size,
    createdBy: row.created_by,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    manufacturer: row.manufacturer,
    model: row.model,
    takenAt: row.taken_at ? row.taken_at.toISOString() : null,
    exposureTime: row.exposure_time,
    aperture: row.aperture,
    iso: row.iso,
    modifiedAt: row.modified_at ? row.modified_at.toISOString() : null,
    focalLength: row.focal_length,
    rating: row.rating || 0,
    url: `/uploads/${row.filename}`,
    // 动态生成压缩图和缩略图信息
    hasCompressed,
    compressedUrl: hasCompressed ? `/uploads/${compressedFileName}` : null,
    hasThumbnail,
    thumbnailUrl: hasThumbnail ? `/uploads/${thumbnailFileName}` : null,
  };

  console.log(`[mapRowToPhoto] 返回结果包含 compressedUrl: ${!!result.compressedUrl}`);
  return result;
};

async function listPhotos() {
  const [rows] = await pool.query(
    'SELECT * FROM photos ORDER BY created_at DESC'
  );
  return rows.map(mapRowToPhoto);
}

async function insertPhoto(payload) {
  const photoId = uuidv4(); // 生成UUID
  const sql = `INSERT INTO photos
    (id, filename, original_name, title, description, camera, lens, shot_at, location, width, height, dominant_color, file_size, created_by, manufacturer, model, taken_at, exposure_time, aperture, iso, modified_at, focal_length, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    photoId, // 添加UUID作为第一个参数
    payload.filename,
    payload.originalName,
    payload.title,
    payload.description,
    payload.camera,
    payload.lens,
    payload.shotAt ? new Date(payload.shotAt) : null,
    payload.location,
    payload.width,
    payload.height,
    payload.dominantColor,
    payload.fileSize,
    payload.createdBy || null,
    payload.manufacturer || '',
    payload.model || '',
    payload.takenAt ? new Date(payload.takenAt) : null,
    payload.exposureTime || '',
    payload.aperture || '',
    payload.iso || '',
    payload.modifiedAt ? new Date(payload.modifiedAt) : null,
    payload.focalLength || '',
    payload.rating ?? 0,
  ];
  const [result] = await pool.query(sql, params);
  return getPhotoById(photoId);
}

async function getPhotoById(id) {
  const [rows] = await pool.query('SELECT * FROM photos WHERE id = ?', [id]);
  return mapRowToPhoto(rows[0]);
}

async function deletePhoto(id) {
  const [result] = await pool.query('DELETE FROM photos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listPhotos,
  insertPhoto,
  deletePhoto,
  getPhotoById,
  mapRowToPhoto,
};

