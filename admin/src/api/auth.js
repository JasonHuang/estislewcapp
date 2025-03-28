import request from './request';

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

export function changePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  });
}

export function getUsers() {
  return request({
    url: '/auth/users',
    method: 'get'
  });
}

export function createUser(data) {
  return request({
    url: '/auth/users',
    method: 'post',
    data
  });
}

export function updateUserStatus(id, data) {
  return request({
    url: `/auth/users/${id}/status`,
    method: 'put',
    data
  });
} 