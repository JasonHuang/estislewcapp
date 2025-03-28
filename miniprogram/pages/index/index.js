const app = getApp()

Page({
  data: {
    companyName: '屿夏珠宝',
    bannerImages: [
      'https://via.placeholder.com/750x400/FFD700/000000?text=Banner+1',
      'https://via.placeholder.com/750x400/FFD700/000000?text=Banner+2',
      'https://via.placeholder.com/750x400/FFD700/000000?text=Banner+3'
    ],
    features: [
      {
        id: 1,
        icon: 'https://via.placeholder.com/100x100/FFD700/000000?text=设计',
        title: '匠心设计',
        desc: '独特的设计理念，打造专属珠宝'
      },
      {
        id: 2,
        icon: 'https://via.placeholder.com/100x100/FFD700/000000?text=品质',
        title: '品质保证',
        desc: '严选优质材料，品质有保障'
      },
      {
        id: 3,
        icon: 'https://via.placeholder.com/100x100/FFD700/000000?text=团队',
        title: '专业团队',
        desc: '经验丰富的珠宝设计师团队'
      }
    ],
    hotProducts: [
      {
        id: 1,
        name: '18K金钻石戒指',
        price: '¥9999',
        image: 'https://via.placeholder.com/300x300/FFD700/000000?text=戒指'
      },
      {
        id: 2,
        name: '925银项链',
        price: '¥2999',
        image: 'https://via.placeholder.com/300x300/FFD700/000000?text=项链'
      },
      {
        id: 3,
        name: '翡翠手镯',
        price: '¥5999',
        image: 'https://via.placeholder.com/300x300/FFD700/000000?text=手镯'
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
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: this.data.bannerImages
    })
  }
}) 