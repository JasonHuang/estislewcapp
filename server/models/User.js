const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 使用固定的盐值
const SALT = '$2a$10$QEv6k1vi96OzC.APUnpsDe';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'editor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('比对密码：', {
      输入密码: candidatePassword,
      数据库密码哈希: this.password
    });
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('密码匹配结果：', isMatch);
    return isMatch;
  } catch (error) {
    console.error('密码比对错误：', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema); 