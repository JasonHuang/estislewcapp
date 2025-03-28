import request from './request';

export function getBanners() {
  return request({
    url: '/banners/admin',
    method: 'get'
  });
}

export function createBanner(data) {
  return request({
    url: '/banners/admin',
    method: 'post',
    data
  });
}

export function updateBanner(id, data) {
  return request({
    url: `/banners/admin/${id}`,
    method: 'put',
    data
  });
}

export function deleteBanner(id) {
  return request({
    url: `/banners/admin/${id}`,
    method: 'delete'
  });
}

export function updateBannerOrder(orders) {
  return request({
    url: '/banners/admin/reorder',
    method: 'put',
    data: { orders }
  });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/upload/single',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
} 