// products.js
Page({
  data: {
    categories: [
      { id: 'all', name: '全部' },
      { id: 'necklace', name: '项链' },
      { id: 'ring', name: '戒指' },
      { id: 'bracelet', name: '手链' },
      { id: 'earring', name: '耳饰' }
    ],
    currentCategory: 'all',
    products: [
      {
        id: 1,
        name: '18K金钻石项链',
        price: '¥3,999',
        image: '/images/product1.jpg',
        category: 'necklace',
        description: '采用18K金材质，镶嵌天然钻石，简约而不失优雅',
        detail: {
          material: '18K金、钻石',
          weight: '3.5g',
          style: '简约',
          suitable: '日常、派对'
        }
      },
      {
        id: 2,
        name: '玫瑰金戒指',
        price: '¥2,599',
        image: '/images/product2.jpg',
        category: 'ring',
        description: '玫瑰金材质，精致设计，适合日常佩戴',
        detail: {
          material: '18K玫瑰金',
          weight: '2.8g',
          style: '时尚',
          suitable: '日常、约会'
        }
      },
      {
        id: 3,
        name: '925银手链',
        price: '¥899',
        image: '/images/product3.jpg',
        category: 'bracelet',
        description: '925银材质，简约百搭，适合各种场合',
        detail: {
          material: '925银',
          weight: '5.2g',
          style: '简约',
          suitable: '日常、商务'
        }
      },
      {
        id: 4,
        name: '水滴形钻石耳环',
        price: '¥1,899',
        image: '/images/product4.jpg',
        category: 'earring',
        description: '水滴形设计，镶嵌天然钻石，闪耀动人',
        detail: {
          material: '18K白金、钻石',
          weight: '2.3g',
          style: '优雅',
          suitable: '晚宴、派对'
        }
      },
      {
        id: 5,
        name: '珍珠项链',
        price: '¥1,299',
        image: '/images/product5.jpg',
        category: 'necklace',
        description: '天然淡水珍珠，优雅大方，适合正式场合',
        detail: {
          material: '淡水珍珠、925银',
          weight: '12g',
          style: '典雅',
          suitable: '正式场合、婚礼'
        }
      },
      {
        id: 6,
        name: '双层手链',
        price: '¥799',
        image: '/images/product6.jpg',
        category: 'bracelet',
        description: '双层设计，925银材质，镶嵌锆石，时尚个性',
        detail: {
          material: '925银、锆石',
          weight: '6.5g',
          style: '时尚',
          suitable: '日常、派对'
        }
      }
    ],
    filteredProducts: []
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '产品展示'
    })
    this.filterProducts('all')
  },
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    })
    this.filterProducts(category)
  },
  filterProducts: function(category) {
    let filtered = this.data.products
    if (category !== 'all') {
      filtered = this.data.products.filter(item => item.category === category)
    }
    this.setData({
      filteredProducts: filtered
    })
  },
  viewProductDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '产品详情',
      content: '该功能正在开发中，敬请期待！',
      showCancel: false
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