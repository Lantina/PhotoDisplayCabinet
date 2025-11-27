const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '123456',
  DB_NAME = 'camarts',
  ADMIN_USERNAME = 'admin',
  ADMIN_PASSWORD = 'admin123',
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      description TEXT,
      camera VARCHAR(255),
      lens VARCHAR(255),
      shot_at DATETIME NULL,
      location VARCHAR(255),
      width INT,
      height INT,
      dominant_color VARCHAR(64),
      file_size INT,
      created_by VARCHAR(128),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensurePhotoColumns();
}

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_NAME, table, column]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
    console.log(`[DB] Added column ${column} to ${table}`);
  }
}

async function ensurePhotoColumns() {
  await addColumnIfMissing(
    'photos',
    'rating',
    'rating TINYINT DEFAULT 0'
  );
  await addColumnIfMissing(
    'photos',
    'manufacturer',
    'manufacturer VARCHAR(255)'
  );
  await addColumnIfMissing('photos', 'model', 'model VARCHAR(255)');
  await addColumnIfMissing(
    'photos',
    'taken_at',
    'taken_at DATETIME NULL'
  );
  await addColumnIfMissing(
    'photos',
    'exposure_time',
    'exposure_time VARCHAR(64)'
  );
  await addColumnIfMissing(
    'photos',
    'aperture',
    'aperture VARCHAR(32)'
  );
  await addColumnIfMissing('photos', 'iso', 'iso VARCHAR(32)');
  await addColumnIfMissing(
    'photos',
    'modified_at',
    'modified_at DATETIME NULL'
  );
  await addColumnIfMissing(
    'photos',
    'focal_length',
    'focal_length VARCHAR(64)'
  );
}

async function ensureDefaultAdmin() {
  const [rows] = await pool.query('SELECT id FROM admins WHERE username = ?', [
    ADMIN_USERNAME,
  ]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [
      ADMIN_USERNAME,
      hash,
    ]);
    console.log(`[DB] 已创建默认管理员 ${ADMIN_USERNAME}`);
  }
}

async function initDb() {
  await ensureDatabase();
  await ensureTables();
  await ensureDefaultAdmin();
  console.log('[DB] MySQL 初始化完成');
}

module.exports = {
  pool,
  initDb,
};

