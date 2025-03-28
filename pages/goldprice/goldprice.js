// goldprice.js
Page({
  data: {
    loading: true,
    goldData: {
      currentPrice: '428.54',
      unit: '元/克',
      updateTime: '2024-05-01 10:30:00',
      trend: 'up', // up, down, stable
      changeAmount: '+2.15',
      changePercent: '+0.50%',
      dailyData: [
        { date: '05-01', price: '428.54' },
        { date: '04-30', price: '426.39' },
        { date: '04-29', price: '427.12' },
        { date: '04-28', price: '425.85' },
        { date: '04-27', price: '424.93' },
        { date: '04-26', price: '425.31' },
        { date: '04-25', price: '426.10' }
      ],
      chartData: {
        categories: ['04-25', '04-26', '04-27', '04-28', '04-29', '04-30', '05-01'],
        series: [426.10, 425.31, 424.93, 425.85, 427.12, 426.39, 428.54]
      },
      jewelryPrice: [
        { type: '足金(24K)', price: '432.00' },
        { type: 'K金(18K)', price: '324.00' },
        { type: '铂金(PT950)', price: '298.00' },
        { type: '银(Ag9999)', price: '5.20' }
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
    })
    // 模拟加载数据
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 800)
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