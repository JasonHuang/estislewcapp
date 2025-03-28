const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// 获取用户列表（仅管理员）
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await User.countDocuments();
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 创建用户（仅管理员）
router.post('/admin', [
  verifyToken,
  verifyAdmin,
  body('username').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'editor'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;
    console.log('创建用户请求:', { username, role });

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const user = new User({
      username,
      password,
      role,
      isActive: true,
      openid: `local_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    });

    console.log('准备保存用户');
    await user.save();
    console.log('用户已保存');
    
    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    next(error); // 传递错误到全局错误处理中间件
  }
});

// 更新用户（仅管理员）
router.put('/admin/:id', [
  verifyToken,
  verifyAdmin
], async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '更新用户失败', error: error.message });
  }
});

// 删除用户（仅管理员）
router.delete('/admin/:id', [
  verifyToken,
  verifyAdmin
], async (req, res) => {
  try {
    // 检查是否尝试删除自己
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: '管理员不能删除自己' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.role === 'admin') {
      // 检查是否至少还有一个管理员
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: '不能删除唯一的管理员用户' });
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
});

// 修改用户密码（仅管理员）
router.put('/admin/change-password', [
  verifyToken,
  verifyAdmin,
  body('userId').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '修改密码失败', error: error.message });
  }
});

module.exports = router; 