const app = getApp()

Page({
  data: {
    bannerImages: [
      '/images/banner1.jpg',
      '/images/banner2.jpg',
      '/images/banner3.jpg'
    ],
    companyName: app.globalData.companyName,
    features: [
      {
        id: 1,
        title: '精品设计',
        icon: '/images/design.png',
        desc: '独特的珠宝设计，彰显个性与品味'
      },
      {
        id: 2,
        title: '优质材料',
        icon: '/images/quality.png',
        desc: '严选高品质材料，确保每件珠宝的品质'
      },
      {
        id: 3,
        title: '专业团队',
        icon: '/images/team.png',
        desc: '经验丰富的团队，提供专业珠宝服务'
      }
    ],
    hotProducts: [
      {
        id: 1,
        name: '18K金钻石项链',
        image: '/images/product1.jpg',
        price: '¥3,999'
      },
      {
        id: 2,
        name: '玫瑰金戒指',
        image: '/images/product2.jpg',
        price: '¥2,599'
      },
      {
        id: 3,
        name: '925银手链',
        image: '/images/product3.jpg',
        price: '¥899'
      }
    ]
  },
  onLoad: function() {
    // 页面加载时执行，可以进行数据请求等操作
  },
  navigateToProducts: function() {
    wx.switchTab({
      url: '/pages/products/products'
    })
  },
  navigateToAbout: function() {
    wx.switchTab({
      url: '/pages/about/about'
    })
  },
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: [current]
    })
  }
}) 