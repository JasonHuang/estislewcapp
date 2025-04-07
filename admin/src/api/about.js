import request from '@/utils/request';

// 获取"关于我们"信息
export function getAboutInfo() {
  return request({
    url: '/about',
    method: 'get'
  });
}

// 更新"关于我们"信息
export function updateAboutInfo(data) {
  return request({
    url: '/about',
    method: 'put',
    data
  });
} 