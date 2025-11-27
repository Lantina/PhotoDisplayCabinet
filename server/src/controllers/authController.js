const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminService = require('../services/adminService');

const JWT_SECRET = process.env.JWT_SECRET || 'camarts-secret';

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }

    const admin = await adminService.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const matched = await bcrypt.compare(password, admin.password_hash);
    if (!matched) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};

