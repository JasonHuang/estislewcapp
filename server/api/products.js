const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

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
router.get('/admin/list', async (req, res) => {
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
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    res.json({ message: '产品已删除' });
  } catch (error) {
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