const api = require('../../utils/api');

Page({
  data: {
    product: null,
    loading: true,
    currentImageIndex: 0,
    baseUrl: 'http://127.0.0.1:3001' // 使用本地回环地址
  },

  onLoad(options) {
    if (options.id) {
      this.loadProductDetail(options.id);
    }
  },

  // 加载产品详情
  loadProductDetail(id) {
    this.setData({ loading: true });
    
    // 先获取分类列表
    api.products.getCategories()
      .then(categories => {
        this.categories = categories; // 存储分类列表
        return api.products.getDetail(id); // 获取产品详情
      })
      .then(product => {
        // 找到产品分类名称
        let categoryName = '未分类';
        if (product.category && this.categories) {
          const category = this.categories.find(cat => cat._id === product.category);
          if (category) {
            categoryName = category.name;
          }
        }
        
        // 处理产品数据
        const formattedProduct = {
          ...product,
          images: product.images.map(img => this.data.baseUrl + img),
          formattedPrice: `¥${product.price.toFixed(2)}`,
          categoryName: categoryName
        };
        
        this.setData({ 
          product: formattedProduct,
          loading: false
        });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: product.name || '产品详情'
        });
      })
      .catch(error => {
        console.error('加载产品详情失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
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