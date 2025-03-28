const express = require('express');
const router = express.Router();
const GoldPrice = require('../models/GoldPrice');
const axios = require('axios');

// 获取最新金价
router.get('/latest', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    
    const latestPrices = await GoldPrice.find(query)
      .sort({ timestamp: -1 })
      .limit(1);

    if (latestPrices.length === 0) {
      return res.status(404).json({ message: '暂无金价数据' });
    }

    res.json(latestPrices[0]);
  } catch (error) {
    res.status(500).json({ message: '获取金价失败', error: error.message });
  }
});

// 获取历史金价
router.get('/history', async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 30 } = req.query;
    const query = { type };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const prices = await GoldPrice.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: '获取历史金价失败', error: error.message });
  }
});

// 更新金价（需要管理员权限）
router.post('/update', async (req, res) => {
  try {
    const { type, price, source } = req.body;
    
    const goldPrice = new GoldPrice({
      type,
      price,
      source,
      timestamp: new Date()
    });

    await goldPrice.save();
    res.status(201).json(goldPrice);
  } catch (error) {
    res.status(500).json({ message: '更新金价失败', error: error.message });
  }
});

// 从外部API获取金价（需要管理员权限）
router.post('/fetch-external', async (req, res) => {
  try {
    // 这里需要替换为实际的金价API
    const response = await axios.get('https://api.example.com/gold-price', {
      headers: {
        'Authorization': `Bearer ${process.env.GOLD_PRICE_API_KEY}`
      }
    });

    const { type, price } = response.data;
    const goldPrice = new GoldPrice({
      type,
      price,
      source: 'external-api',
      timestamp: new Date()
    });

    await goldPrice.save();
    res.status(201).json(goldPrice);
  } catch (error) {
    res.status(500).json({ message: '获取外部金价失败', error: error.message });
  }
});

module.exports = router; 