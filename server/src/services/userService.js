const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  try {
    const [result] = await pool.query(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword]
    );

    return {
      id: userId,
      username,
      email,
      status: 'pending'
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('username')) {
        throw new Error('用户名已存在');
      }
      if (error.message.includes('email')) {
        throw new Error('邮箱已存在');
      }
    }
    throw error;
  }
};

const findByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const getPendingUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE status = ? ORDER BY created_at ASC',
    ['pending']
  );
  return rows;
};

const updateUserStatus = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE users SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
};

const getAllUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, username, email, status, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
};

module.exports = {
  createUser,
  findByUsername,
  findByEmail,
  findById,
  getPendingUsers,
  updateUserStatus,
  getAllUsers,
};