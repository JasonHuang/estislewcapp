const api = require('../../utils/api');

Page({
  data: {
    currentPrice: null,
    historyPrices: [],
    selectedType: 'Au9999',
    types: [
      { value: 'Au9999', label: 'Au9999' },
      { value: 'Au999', label: 'Au999' },
      { value: 'Au995', label: 'Au995' },
      { value: 'Au990', label: 'Au990' },
      { value: 'Au950', label: 'Au950' },
      { value: 'Au900', label: 'Au900' }
    ],
    loading: false
  },

  onLoad() {
    this.fetchLatestPrice();
    this.fetchHistoryPrices();
  },

  // 获取最新金价
  async fetchLatestPrice() {
    try {
      this.setData({ loading: true });
      const price = await api.goldPrice.getLatest(this.data.selectedType);
      this.setData({ currentPrice: price });
    } catch (error) {
      wx.showToast({
        title: '获取金价失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 获取历史金价
  async fetchHistoryPrices() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 获取最近30天的数据

      const prices = await api.goldPrice.getHistory({
        type: this.data.selectedType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      this.setData({ historyPrices: prices });
    } catch (error) {
      wx.showToast({
        title: '获取历史数据失败',
        icon: 'none'
      });
    }
  },

  // 切换金价类型
  onTypeChange(e) {
    const type = e.detail.value;
    this.setData({ selectedType: type }, () => {
      this.fetchLatestPrice();
      this.fetchHistoryPrices();
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([
      this.fetchLatestPrice(),
      this.fetchHistoryPrices()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  }
}); 