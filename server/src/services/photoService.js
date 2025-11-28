const { pool } = require('../config/db');

const mapRowToPhoto = (row) => {
  if (!row) return null;
  return {
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
  };
};

async function listPhotos() {
  const [rows] = await pool.query(
    'SELECT * FROM photos ORDER BY created_at DESC'
  );
  return rows.map(mapRowToPhoto);
}

async function insertPhoto(payload) {
  const sql = `INSERT INTO photos
    (filename, original_name, title, description, camera, lens, shot_at, location, width, height, dominant_color, file_size, created_by, manufacturer, model, taken_at, exposure_time, aperture, iso, modified_at, focal_length, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
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
  return getPhotoById(result.insertId);
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

