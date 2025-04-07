const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 获取"关于我们"信息（公开访问）
router.get('/', async (req, res) => {
  try {
    // 获取数据库中的第一条记录，如果不存在则创建一条默认记录
    let aboutInfo = await About.findOne();
    
    if (!aboutInfo) {
      aboutInfo = new About();
      await aboutInfo.save();
    }
    
    res.json(aboutInfo);
  } catch (error) {
    console.error('获取关于我们信息失败:', error);
    res.status(500).json({ message: '获取关于我们信息失败', error: error.message });
  }
});

// 更新"关于我们"信息（需要管理员权限）
router.put('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      companyName, logo, intro, vision, values,
      address, phone, email, wechat, team
    } = req.body;
    
    let aboutInfo = await About.findOne();
    
    if (!aboutInfo) {
      aboutInfo = new About();
    }
    
    // 更新信息
    if (companyName) aboutInfo.companyName = companyName;
    if (logo) aboutInfo.logo = logo;
    if (intro) aboutInfo.intro = intro;
    if (vision) aboutInfo.vision = vision;
    if (values) aboutInfo.values = values;
    if (address) aboutInfo.address = address;
    if (phone) aboutInfo.phone = phone;
    if (email) aboutInfo.email = email;
    if (wechat) aboutInfo.wechat = wechat;
    if (team) aboutInfo.team = team;
    
    // 记录更新信息
    aboutInfo.updatedBy = req.user.id;
    aboutInfo.updatedAt = new Date();
    
    await aboutInfo.save();
    
    res.json(aboutInfo);
  } catch (error) {
    console.error('更新关于我们信息失败:', error);
    res.status(500).json({ message: '更新关于我们信息失败', error: error.message });
  }
});

module.exports = router; 