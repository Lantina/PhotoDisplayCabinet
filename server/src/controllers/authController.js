const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminService = require('../services/adminService');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'pdcabinet-secret';

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

const userRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写完整的注册信息' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: '用户名至少需要3个字符' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' });
    }

    const user = await userService.createUser(username, email, password);

    res.status(201).json({
      message: '注册成功，请等待管理员审核',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }

    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    // 允许pending和approved状态的用户登录，只有rejected状态不能登录
    if (user.status === 'rejected') {
      return res.status(403).json({ message: '账号已被拒绝，无法登录' });
    }

    const matched = await bcrypt.compare(password, user.password_hash);
    if (!matched) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, type: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPendingUsers = async (req, res, next) => {
  try {
    const users = await userService.getPendingUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await userService.updateUserStatus(id, 'approved');

    if (!success) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ message: '用户已批准' });
  } catch (error) {
    next(error);
  }
};

const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await userService.updateUserStatus(id, 'rejected');

    if (!success) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ message: '用户已拒绝' });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  userRegister,
  userLogin,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
};

