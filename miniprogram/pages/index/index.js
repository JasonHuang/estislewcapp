const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    companyName: '屿夏珠宝',
    bannerImages: [
      '/images/products/images-1743149752673-55580222.jpg',
      '/images/products/images-1743149450610-932613907.jpg'
    ],
    features: [
      {
        id: 1,
        icon: '/images/products/images-1743149752673-55580222.jpg',
        title: '匠心设计',
        desc: '独特的设计理念，打造专属珠宝'
      },
      {
        id: 2,
        icon: '/images/products/images-1743149450610-932613907.jpg',
        title: '品质保证',
        desc: '严选优质材料，品质有保障'
      },
      {
        id: 3,
        icon: '/images/products/images-1743149374638-913464042.jpg',
        title: '专业团队',
        desc: '经验丰富的珠宝设计师团队'
      }
    ],
    hotProducts: [
      {
        id: '1',
        name: '18K金钻石戒指',
        price: '¥9999',
        image: '/images/products/images-1743149752673-55580222.jpg'
      },
      {
        id: '2',
        name: '925银项链',
        price: '¥2999',
        image: '/images/products/images-1743149450610-932613907.jpg'
      }
    ],
    loading: true,
    baseUrl: 'http://127.0.0.1:3001'  // 使用本地回环地址
  },
  onLoad: function() {
    // 页面加载时执行，从API获取数据
    this.fetchBanners()
    this.fetchHotProducts()
  },
  // 获取轮播图
  fetchBanners: function() {
    wx.showLoading({
      title: '加载中...',
    })
    api.banners.getList().then(res => {
      // 筛选启用的轮播图
      const activeBanners = res.filter(banner => banner.isActive)
      this.setData({
        bannerImages: activeBanners.map(banner => this.data.baseUrl + banner.image)
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('获取轮播图失败:', err)
      wx.hideLoading()
      // 使用默认banner，不显示错误提示
    })
  },
  // 获取热门产品
  fetchHotProducts: function() {
    api.products.getList({
      isHot: true,
      limit: 6
    }).then(res => {
      const products = res.products.map(product => ({
        id: product._id,
        name: product.name,
        price: `¥${product.price.toFixed(2)}`,
        image: product.images[0] ? this.data.baseUrl + product.images[0] : '/images/products/images-1743149752673-55580222.jpg'
      }))
      this.setData({
        hotProducts: products,
        loading: false
      })
    }).catch(err => {
      console.error('获取热门产品失败:', err)
      // 使用默认产品，不显示错误提示
      this.setData({
        loading: false
      })
    })
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