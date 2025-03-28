import request from './request';

export function getProducts(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  });
}

export function getProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  });
}

export function createProduct(data) {
  return request({
    url: '/products/admin',
    method: 'post',
    data
  });
}

export function updateProduct(id, data) {
  return request({
    url: `/products/admin/${id}`,
    method: 'put',
    data
  });
}

export function deleteProduct(id) {
  return request({
    url: `/products/admin/${id}`,
    method: 'delete'
  });
}

export function updateProductStatus(id, data) {
  return request({
    url: `/products/admin/${id}/status`,
    method: 'put',
    data
  });
}

export function uploadImages(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  return request({
    url: '/upload/multiple',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
} 