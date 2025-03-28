const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { body, validationResult } = require('express-validator');

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
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!banner) {
      return res.status(404).json({ message: '轮播图不存在' });
    }
    res.json({ message: '轮播图已删除' });
  } catch (error) {
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