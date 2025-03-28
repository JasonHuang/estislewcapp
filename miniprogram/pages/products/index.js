const api = require('../../utils/api');

Page({
  data: {
    products: [],
    categories: ['全部', '戒指', '项链', '手链', '耳环', '手镯', '其他'],
    currentCategory: '全部',
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadProducts();
  },

  // 加载产品列表
  async loadProducts(refresh = false) {
    if (this.data.loading || (!refresh && !this.data.hasMore)) return;

    try {
      this.setData({ loading: true });
      const params = {
        page: refresh ? 1 : this.data.page,
        limit: 10
      };

      if (this.data.currentCategory !== '全部') {
        params.category = this.data.currentCategory;
      }

      const { products, total, page, totalPages } = await api.products.getList(params);
      
      this.setData({
        products: refresh ? products : [...this.data.products, ...products],
        page: page + 1,
        hasMore: page < totalPages,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category }, () => {
      this.loadProducts(true);
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadProducts(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadProducts();
  },

  // 跳转到产品详情
  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/products/detail?id=${id}`
    });
  }
}); 