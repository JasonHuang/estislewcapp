const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// 辅助函数：从URL路径中删除文件
const deleteFileFromPath = (filePath) => {
  try {
    // 如果路径是URL格式，提取路径部分
    if (filePath) {
      // 移除URL前缀，保留路径部分
      const relativePath = filePath.startsWith('/') 
        ? filePath.substring(1) // 如果是以/开头，去掉/
        : filePath;
      
      const fullPath = path.join(__dirname, '..', relativePath);
      
      // 检查文件是否存在
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`已删除文件: ${fullPath}`);
        return true;
      } else {
        console.log(`文件不存在: ${fullPath}`);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('删除文件错误:', error);
    return false;
  }
};

// 获取轮播图列表（前台）
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: '获取轮播图失败', error: error.message });
  }
});

// 获取轮播图列表（后台）
router.get('/admin', async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: '获取轮播图失败', error: error.message });
  }
});

// 创建轮播图（后台）
router.post('/admin', [
  body('title').notEmpty().trim(),
  body('image').notEmpty(),
  body('link').optional(),
  body('order').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: '创建轮播图失败', error: error.message });
  }
});

// 更新轮播图（后台）
router.put('/admin/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ message: '轮播图不存在' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: '更新轮播图失败', error: error.message });
  }
});

// 删除轮播图（后台）
router.delete('/admin/:id', async (req, res) => {
  try {
    // 先获取轮播图数据，以便获取图片路径
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: '轮播图不存在' });
    }
    
    // 尝试删除图片文件
    if (banner.image) {
      deleteFileFromPath(banner.image);
    }
    
    // 从数据库中真实删除记录
    await Banner.findByIdAndDelete(req.params.id);
    
    res.json({ message: '轮播图已删除', success: true });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    res.status(500).json({ message: '删除轮播图失败', error: error.message });
  }
});

// 更新轮播图顺序（后台）
router.put('/admin/reorder', async (req, res) => {
  try {
    const { orders } = req.body;
    await Promise.all(
      orders.map(({ id, order }) => 
        Banner.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ message: '顺序更新成功' });
  } catch (error) {
    res.status(500).json({ message: '更新顺序失败', error: error.message });
  }
});

module.exports = router; 