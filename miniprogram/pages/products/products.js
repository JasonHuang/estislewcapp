// products.js
const api = require('../../utils/api.js')

Page({
  data: {
    categories: [{ _id: 'all', name: '全部' }],
    currentCategory: 'all',
    products: [],
    filteredProducts: [],
    loading: true,
    page: 1,
    limit: 10,
    hasMore: true,
    baseUrl: 'http://127.0.0.1:3001' // 使用本地回环地址
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '产品展示'
    })
    this.fetchCategories()
    this.fetchProducts()
  },
  fetchCategories: function() {
    wx.showLoading({
      title: '加载中...',
    })
    api.products.getCategories().then(res => {
      // 添加全部分类到开头
      const allCategories = [{ _id: 'all', name: '全部' }].concat(
        res.map(category => ({
          _id: category._id,
          name: category.name
        }))
      )
      this.setData({
        categories: allCategories
      })
    }).catch(err => {
      console.error('获取分类失败:', err)
      wx.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  fetchProducts: function(isLoadMore = false) {
    if (!isLoadMore) {
      this.setData({
        loading: true,
        page: 1,
        hasMore: true
      })
    }
    
    const params = {
      page: this.data.page,
      limit: this.data.limit
    }
    
    // 如果不是全部分类，则按分类筛选
    if (this.data.currentCategory !== 'all') {
      params.category = this.data.currentCategory
    }
    
    api.products.getList(params).then(res => {
      const formattedProducts = res.products.map(product => ({
        id: product._id,
        name: product.name,
        price: `¥${product.price.toFixed(2)}`,
        image: product.images[0] ? this.data.baseUrl + product.images[0] : '/images/products/images-1743149752673-55580222.jpg',
        category: product.category,
        description: product.description
      }))
      
      this.setData({
        products: isLoadMore ? this.data.products.concat(formattedProducts) : formattedProducts,
        filteredProducts: isLoadMore ? this.data.filteredProducts.concat(formattedProducts) : formattedProducts,
        loading: false,
        hasMore: res.products.length === this.data.limit
      })
    }).catch(err => {
      console.error('获取产品列表失败:', err)
      wx.showToast({
        title: '获取产品失败',
        icon: 'none'
      })
      this.setData({
        loading: false
      })
    })
  },
  // 加载更多产品
  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    })
    
    this.fetchProducts(true)
  },
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      products: [],
      filteredProducts: []
    })
    this.fetchProducts()
  },
  viewProductDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `detail?id=${id}`
    })
  },
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.fetchProducts()
    wx.stopPullDownRefresh()
  },
  // 上拉加载更多
  onReachBottom: function() {
    this.loadMore()
  }
}) 