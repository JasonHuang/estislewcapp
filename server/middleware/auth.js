const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};

// 验证管理员权限
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: '验证权限失败' });
  }
};

// 验证编辑者权限
const verifyEditor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return res.status(403).json({ message: '需要编辑者权限' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: '验证权限失败' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyEditor
}; 