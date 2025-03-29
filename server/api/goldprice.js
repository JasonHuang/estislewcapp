const express = require('express');
const router = express.Router();
const GoldPrice = require('../models/GoldPrice');
const axios = require('axios');

// 获取最新金价
router.get('/latest', async (req, res) => {
  try {
    const { type = 'Au9999' } = req.query;
    
    // 使用新浪财经API获取黄金期货价格
    const response = await axios.get('https://hq.sinajs.cn/list=AU2406', {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // 解析返回的数据
    const data = response.data;
    const priceMatch = data.match(/\"([^\"]+)\"/);
    
    if (!priceMatch) {
      return res.status(404).json({ message: '暂无金价数据' });
    }

    const priceData = priceMatch[1].split(',');
    // 新浪财经返回的是每克价格，需要除以1000转换为元/克
    // 使用最新价（priceData[3]）而不是结算价
    const price = parseFloat(priceData[3]) / 1000;
    
    // 验证价格是否合理
    if (price < 100 || price > 1000) {
      console.error('获取到的金价异常:', price);
      // 如果价格异常，返回模拟数据
      const mockPrice = {
        type,
        price: 720.00,
        source: 'mock-data',
        timestamp: new Date()
      };
      return res.json(mockPrice);
    }
    
    // 保存到数据库
    const goldPrice = new GoldPrice({
      type,
      price,
      source: 'sina-finance',
      timestamp: new Date()
    });
    await goldPrice.save();

    res.json(goldPrice);
  } catch (error) {
    console.error('获取金价失败:', error);
    // 如果获取失败，返回一个模拟的合理金价
    const mockPrice = {
      type: 'Au9999',
      price: 720.00,
      source: 'mock-data',
      timestamp: new Date()
    };
    res.json(mockPrice);
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