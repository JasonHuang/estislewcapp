const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/estislewcapp';

// 默认管理员配置
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  name: '系统管理员'
};

// 使用固定的盐值
const SALT = '$2a$10$QEv6k1vi96OzC.APUnpsDe';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
  process.exit(0);
}

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('管理员用户已存在，用户名:', existingAdmin.username);
      return;
    }

    // 使用固定的盐值生成密码哈希
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    console.log('生成的密码哈希：', hashedPassword);
    
    const adminUser = new User({
      ...DEFAULT_ADMIN,
      password: hashedPassword
    });

    await adminUser.save();
    console.log('管理员用户创建成功');
    console.log('用户名:', DEFAULT_ADMIN.username);
    console.log('密码:', DEFAULT_ADMIN.password);
  } catch (error) {
    console.error('创建管理员用户失败:', error);
  }
}

async function resetAdminPassword() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('未找到管理员用户，请先创建');
      return;
    }

    // 使用固定的盐值生成密码哈希
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    console.log('生成的密码哈希：', hashedPassword);
    
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('管理员密码重置成功');
    console.log('用户名:', admin.username);
    console.log('新密码:', DEFAULT_ADMIN.password);
  } catch (error) {
    console.error('重置管理员密码失败:', error);
  }
}

async function deleteAdmin() {
  try {
    const result = await User.deleteOne({ role: 'admin' });
    if (result.deletedCount > 0) {
      console.log('管理员用户删除成功');
    } else {
      console.log('未找到管理员用户');
    }
  } catch (error) {
    console.error('删除管理员用户失败:', error);
  }
}

async function main() {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0] || 'create';

  switch (command) {
    case 'create':
      await createAdmin();
      break;
    case 'reset':
      await resetAdminPassword();
      break;
    case 'delete':
      await deleteAdmin();
      break;
    default:
      console.log('无效的命令。可用命令: create, reset, delete');
  }

  await closeDB();
}

main(); 