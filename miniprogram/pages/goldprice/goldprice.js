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
    const categories = prices.map(p => this.formatDate(p.timestamp));
    const series = prices.map(p => p.price);
    return { categories, series };
  },

  // 处理每日数据
  processDailyData(prices) {
    return prices.map(p => ({
      date: this.formatDate(p.timestamp),
      price: p.price.toFixed(2)
    }));
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 格式化时间
  formatTime(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  },

  switchTab: function(e) {
    const tabId = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tabId
    })
  },
  refreshPrice: function() {
    this.setData({ loading: true })
    // 模拟刷新数据
    setTimeout(() => {
      this.setData({
        loading: false,
        'goldData.updateTime': this.getCurrentTime()
      })
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }, 1000)
  },
  getCurrentTime: function() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },
  // 通知提醒功能
  setNotification: function() {
    wx.showModal({
      title: '设置提醒',
      content: '当金价达到目标价格时通知您？',
      confirmText: '设置',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
      }
    })
  }
}) 