const api = require('../../utils/api');

Page({
  data: {
    product: null,
    loading: false,
    currentImageIndex: 0
  },

  onLoad(options) {
    if (options.id) {
      this.loadProductDetail(options.id);
    }
  },

  // 加载产品详情
  async loadProductDetail(id) {
    try {
      this.setData({ loading: true });
      const product = await api.products.getDetail(id);
      this.setData({ product });
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 切换图片
  onImageChange(e) {
    const { current } = e.detail;
    this.setData({ currentImageIndex: current });
  },

  // 预览图片
  onPreviewImage() {
    const { product } = this.data;
    wx.previewImage({
      urls: product.images,
      current: product.images[this.data.currentImageIndex]
    });
  },

  // 分享
  onShareAppMessage() {
    const { product } = this.data;
    return {
      title: product.name,
      path: `/pages/products/detail?id=${product._id}`,
      imageUrl: product.images[0]
    };
  }
}); 