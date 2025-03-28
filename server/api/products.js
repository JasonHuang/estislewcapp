const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');

// 获取产品列表
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '获取产品列表失败', error: error.message });
  }
});

// 获取单个产品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '获取产品详情失败', error: error.message });
  }
});

// 创建新产品（需要管理员权限）
router.post('/', [
  body('name').notEmpty().trim(),
  body('category').isIn(['戒指', '项链', '手链', '耳环', '手镯', '其他']),
  body('description').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('images').isArray(),
  body('specifications').isObject(),
  body('stock').isInt({ min: 0 })
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

// 更新产品（需要管理员权限）
router.put('/:id', async (req, res) => {
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

// 删除产品（需要管理员权限）
router.delete('/:id', async (req, res) => {
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

module.exports = router; 