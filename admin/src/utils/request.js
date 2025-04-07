import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const service = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求：', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应：', response.data);
    const res = response.data;
    return res;
  },
  error => {
    console.error('响应错误：', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          const userStore = useUserStore();
          userStore.logoutUser();
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(error.response.data?.message || '请求失败');
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default service; 