const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 获取所有分类（前台）
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '获取分类失败', error: error.message });
  }
});

// 获取所有分类（后台）
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '获取分类失败', error: error.message });
  }
});

// 创建分类（后台）
router.post('/admin', [
  verifyToken,
  verifyAdmin,
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(400).json({ message: '分类名称已存在' });
    }

    const category = new Category({
      name: req.body.name,
      order: req.body.order || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: '创建分类失败', error: error.message });
  }
});

// 更新分类（后台）
router.put('/admin/:id', [
  verifyToken,
  verifyAdmin,
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 检查分类名称是否已存在（排除当前分类）
    const existingCategory = await Category.findOne({ 
      name: req.body.name, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: '分类名称已存在' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        order: req.body.order || 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: '更新分类失败', error: error.message });
  }
});

// 删除分类（后台）
router.delete('/admin/:id', [verifyToken, verifyAdmin], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    // TODO: 检查是否有产品使用该分类
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ message: '删除分类失败', error: error.message });
  }
});

module.exports = router; 