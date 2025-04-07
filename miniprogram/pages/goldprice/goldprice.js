// goldprice.js
const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    goldData: {
      currentPrice: '--',
      unit: '元/克',
      updateTime: '--',
      trend: 'stable',
      changeAmount: '--',
      changePercent: '--',
      dailyData: [],
      chartData: {
        categories: [],
        series: []
      },
      chartYAxis: {
        min: 0,
        mid: 0,
        max: 0
      },
      chartStats: {
        max: '--',
        min: '--',
        avg: '--',
        range: '--'
      },
      jewelryPrice: [
        { type: '足金(24K)', price: '--' },
        { type: 'K金(18K)', price: '--' },
        { type: '铂金(PT950)', price: '--' },
        { type: '银(Ag9999)', price: '--' }
      ]
    },
    tabs: [
      { id: 'price', name: '实时金价' },
      { id: 'trend', name: '价格走势' },
      { id: 'jewelry', name: '饰品金价' }
    ],
    currentTab: 'price'
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '金价行情'
    });
    this.fetchGoldPrice();
  },

  // 获取金价数据
  async fetchGoldPrice() {
    try {
      this.setData({ loading: true });
      const price = await api.goldPrice.getLatest('Au9999');
      
      // 计算饰品金价
      const jewelryPrices = this.calculateJewelryPrices(price.price);
      
      this.setData({
        loading: false,
        'goldData.currentPrice': price.price.toFixed(2),
        'goldData.updateTime': this.formatTime(price.timestamp),
        'goldData.jewelryPrice': jewelryPrices
      });

      // 获取历史数据用于计算趋势
      await this.fetchHistoryPrices();
    } catch (error) {
      console.error('获取金价失败:', error);
      wx.showToast({
        title: '获取金价失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 获取历史金价
  async fetchHistoryPrices() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const prices = await api.goldPrice.getHistory({
        type: 'Au9999',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // 更新图表数据
      const chartData = this.processChartData(prices);
      this.setData({
        'goldData.chartData': chartData,
        'goldData.dailyData': this.processDailyData(prices)
      });

      // 计算价格变化
      if (prices.length >= 2) {
        const currentPrice = prices[0].price;
        const previousPrice = prices[1].price;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice * 100).toFixed(2);
        
        this.setData({
          'goldData.trend': change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          'goldData.changeAmount': change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          'goldData.changePercent': `${change > 0 ? '+' : ''}${changePercent}%`
        });
      }
    } catch (error) {
      console.error('获取历史金价失败:', error);
    }
  },

  // 计算饰品金价
  calculateJewelryPrices(basePrice) {
    return [
      { type: '足金(24K)', price: (basePrice * 1.02).toFixed(2) },
      { type: 'K金(18K)', price: (basePrice * 0.75).toFixed(2) },
      { type: '铂金(PT950)', price: (basePrice * 0.7).toFixed(2) },
      { type: '银(Ag9999)', price: (basePrice * 0.012).toFixed(2) }
    ];
  },

  // 处理图表数据
  processChartData(prices) {
    // 使用兼容的方法处理数据
    const categories = [];
    const series = [];
    
    for (let i = 0; i < prices.length; i++) {
      categories.push(this.formatDate(prices[i].timestamp));
      series.push(prices[i].price);
    }
    
    // 计算Y轴数据
    let min = series[0];
    let max = series[0];
    
    // 找出最大值和最小值
    for (let i = 0; i < series.length; i++) {
      if (series[i] < min) min = series[i];
      if (series[i] > max) max = series[i];
    }
    
    // 为了更好的显示效果，扩大范围5%
    const range = max - min;
    min = Math.floor((min - range * 0.05) / 10) * 10; // 向下取整到10的倍数
    max = Math.ceil((max + range * 0.05) / 10) * 10;  // 向上取整到10的倍数
    const mid = Math.round((min + max) / 2);
    
    // 计算统计数据
    const priceMax = Math.max.apply(null, series);
    const priceMin = Math.min.apply(null, series);
    
    // 计算平均价
    let sum = 0;
    for (let i = 0; i < series.length; i++) {
      sum += series[i];
    }
    const avg = sum / series.length;
    
    // 计算波动幅度
    const fluctuationRange = ((priceMax - priceMin) / priceMin * 100);
    
    // 更新统计数据
    this.setData({
      'goldData.chartStats': {
        max: priceMax.toFixed(2),
        min: priceMin.toFixed(2),
        avg: avg.toFixed(2),
        range: fluctuationRange.toFixed(2)
      }
    });
    
    // 更新Y轴数据
    this.setData({
      'goldData.chartYAxis': {
        min,
        mid,
        max
      }
    });
    
    return { categories, series };
  },

  // 处理每日数据
  processDailyData(prices) {
    const result = [];
    for (let i = 0; i < prices.length; i++) {
      result.push({
        date: this.formatDate(prices[i].timestamp),
        price: prices[i].price.toFixed(2)
      });
    }
    return result;
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 格式化时间
  formatTime(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  switchTab: function(e) {
    const tabId = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tabId
    })
  },

  refreshPrice: function() {
    this.setData({ loading: true })
    // 调用实际的刷新接口
    this.fetchGoldPrice().then(() => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }).catch(() => {
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      })
    })
  },

  setNotification: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  }
}) 