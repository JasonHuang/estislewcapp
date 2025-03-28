const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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