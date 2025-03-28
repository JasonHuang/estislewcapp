const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/estislewcapp';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 直接使用 bcrypt 生成哈希
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('明文密码:', plainPassword);
    console.log('生成的哈希密码:', hashedPassword);
    
    // 直接更新数据库，绕过 mongoose 中间件
    const result = await mongoose.connection.collection('users').updateOne(
      { username: 'admin' },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount > 0) {
      console.log('管理员密码重置成功');
      
      // 检查保存的密码是否可以验证
      const admin = await mongoose.connection.collection('users').findOne({ username: 'admin' });
      console.log('数据库中保存的密码哈希:', admin.password);
      
      const isMatch = await bcrypt.compare(plainPassword, admin.password);
      console.log('验证结果:', isMatch ? '成功' : '失败');
    } else {
      console.log('未找到管理员用户');
    }

    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('重置密码失败:', error);
  }
}

resetAdminPassword(); 