import request from './request';

export function getCategories() {
  return request({
    url: '/categories/admin',
    method: 'get'
  });
}

export function createCategory(data) {
  return request({
    url: '/categories/admin',
    method: 'post',
    data
  });
}

export function updateCategory(id, data) {
  return request({
    url: `/categories/admin/${id}`,
    method: 'put',
    data
  });
}

export function deleteCategory(id) {
  return request({
    url: `/categories/admin/${id}`,
    method: 'delete'
  });
}

// 获取前台可用分类（公开）
export function getPublicCategories() {
  return request({
    url: '/categories',
    method: 'get'
  });
} 