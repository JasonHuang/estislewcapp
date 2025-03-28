const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// 使用固定的盐值
const SALT = '$2a$10$QEv6k1vi96OzC.APUnpsDe';

// 登录
router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    console.log('收到登录请求：', {
      username: req.body.username,
      password: req.body.password
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('验证错误：', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username, isActive: true });
    console.log('查找用户结果：', user ? '找到用户' : '未找到用户');

    if (user) {
      console.log('数据库中的密码哈希：', user.password);
      const isMatch = await user.comparePassword(password);
      console.log('密码验证结果：', isMatch);
      
      if (!isMatch) {
        console.log('密码验证失败');
        return res.status(401).json({ message: '用户名或密码错误' });
      }
    } else {
      console.log('用户不存在');
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('登录成功，生成token');
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误：', error);
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 创建用户（仅管理员）
router.post('/users', [
  verifyToken,
  verifyAdmin,
  body('username').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'editor'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const user = new User({
      username,
      password,
      role
    });

    await user.save();
    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '创建用户失败', error: error.message });
  }
});

// 获取用户列表（仅管理员）
router.get('/users', [verifyToken, verifyAdmin], async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 更新用户状态（仅管理员）
router.put('/users/:id/status', [verifyToken, verifyAdmin], async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '更新用户状态失败', error: error.message });
  }
});

// 修改密码
router.put('/password', [
  verifyToken,
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ message: '原密码错误' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '修改密码失败', error: error.message });
  }
});

// 微信登录
router.post('/wx-login', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 这里需要调用微信接口获取openid
    // 实际项目中需要替换为真实的微信API调用
    const mockOpenid = 'mock_openid_' + Date.now();
    
    let user = await User.findOne({ openid: mockOpenid });
    
    if (!user) {
      user = new User({
        openid: mockOpenid,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await user.save();
    } else {
      await user.updateLastLogin();
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const { nickname, avatar, phone, address } = req.body;
    const userId = req.user.userId; // 从JWT中获取

    const user = await User.findByIdAndUpdate(
      userId,
      { nickname, avatar, phone, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: user._id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address
    });
  } catch (error) {
    res.status(500).json({ message: '更新用户信息失败', error: error.message });
  }
});

// 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId; // 从JWT中获取
    const user = await User.findById(userId).select('-openid');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

// 验证管理员权限的中间件
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: '验证权限失败', error: error.message });
  }
};

// 设置管理员（仅超级管理员可用）
router.post('/set-admin', isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ message: '已设置为管理员' });
  } catch (error) {
    res.status(500).json({ message: '设置管理员失败', error: error.message });
  }
});

module.exports = router; 