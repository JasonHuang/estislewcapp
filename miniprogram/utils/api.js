// 开发环境配置
const DEV_CONFIG = {
  BASE_URL: 'http://127.0.0.1:3001/api'  // 使用本地回环地址
};

// 生产环境配置
const PROD_CONFIG = {
  BASE_URL: 'http://your-production-domain.com/api'
};

// 通过判断微信环境来选择配置
const isDev = () => {
  // 在开发工具中运行时，认为是开发环境
  // 可根据实际需求调整判断逻辑
  const accountInfo = wx.getAccountInfoSync();
  return accountInfo.miniProgram.envVersion === 'develop' || 
         accountInfo.miniProgram.envVersion === 'trial';
};

// 根据环境选择配置
const config = isDev() ? DEV_CONFIG : PROD_CONFIG;

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
          console.error(`API错误: ${res.statusCode}`, res.data);
          reject(new Error(res.data?.message || `请求失败，状态码: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error(`请求失败:`, err);
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
    }),
    // 获取产品分类列表
    getCategories: () => request('/categories', {
      method: 'GET'
    })
  },

  // 轮播图相关
  banners: {
    // 获取轮播图列表
    getList: () => request('/banners', {
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
  },
  
  // 关于我们
  about: {
    // 获取关于我们信息
    getInfo: () => request('/about', {
      method: 'GET'
    })
  }
};

module.exports = api; 