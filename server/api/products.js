const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// 获取产品列表（前台）
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取产品列表失败', error: error.message });
  }
});

// 获取热门产品（前台）
router.get('/hot', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isHot: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: '获取热门产品失败', error: error.message });
  }
});

// 获取产品详情（前台）
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '获取产品详情失败', error: error.message });
  }
});

// 获取产品列表（后台）
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = {};
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取产品列表失败', error: error.message });
  }
});

// 创建产品（后台）
router.post('/admin', [
  body('name').notEmpty().trim(),
  body('category').isIn(['戒指', '项链', '手链', '耳环', '手镯', '其他']),
  body('price').isFloat({ min: 0 }),
  body('images').isArray({ min: 1 }),
  body('description').notEmpty(),
  body('specifications').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: '创建产品失败', error: error.message });
  }
});

// 更新产品（后台）
router.put('/admin/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '更新产品失败', error: error.message });
  }
});

// 删除产品（后台）
router.delete('/admin/:id', async (req, res) => {
  try {
    // 先获取产品数据，以便获取图片路径
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    // 尝试删除所有产品图片
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(imagePath => {
        deleteFileFromPath(imagePath);
      });
    }
    
    // 从数据库中真实删除记录
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: '产品已删除', success: true });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500).json({ message: '删除产品失败', error: error.message });
  }
});

// 更新产品状态（后台）
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { isHot, isNewProduct } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isHot, isNewProduct },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '更新产品状态失败', error: error.message });
  }
});

module.exports = router; 