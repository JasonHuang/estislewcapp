// 开发环境配置
const DEV_CONFIG = {
  BASE_URL: 'http://192.168.1.2:3000/api'
};

// 生产环境配置
const PROD_CONFIG = {
  BASE_URL: 'https://your-production-domain.com/api'
};

// 根据环境选择配置
const config = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

// 请求封装
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.BASE_URL}${url}`,
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// API 接口
const api = {
  // 产品相关
  products: {
    // 获取产品列表
    getList: (params) => request('/products', {
      method: 'GET',
      data: params
    }),
    // 获取产品详情
    getDetail: (id) => request(`/products/${id}`, {
      method: 'GET'
    })
  },

  // 金价相关
  goldPrice: {
    // 获取最新金价
    getLatest: (type) => request('/goldprice/latest', {
      method: 'GET',
      data: { type }
    }),
    // 获取历史金价
    getHistory: (params) => request('/goldprice/history', {
      method: 'GET',
      data: params
    })
  },

  // 用户相关
  auth: {
    // 微信登录
    wxLogin: (code) => request('/auth/wx-login', {
      method: 'POST',
      data: { code }
    }),
    // 更新用户信息
    updateProfile: (data) => request('/auth/profile', {
      method: 'PUT',
      data
    }),
    // 获取用户信息
    getProfile: () => request('/auth/profile', {
      method: 'GET'
    })
  }
};

module.exports = api; 