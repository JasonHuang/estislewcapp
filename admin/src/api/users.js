import request from './request';

export function getUsers(params) {
  return request({
    url: '/users/admin',
    method: 'get',
    params
  });
}

export function createUser(data) {
  return request({
    url: '/users/admin',
    method: 'post',
    data
  });
}

export function updateUser(id, data) {
  return request({
    url: `/users/admin/${id}`,
    method: 'put',
    data
  });
}

export function deleteUser(id) {
  return request({
    url: `/users/admin/${id}`,
    method: 'delete'
  });
}

export function changePassword(data) {
  return request({
    url: '/users/admin/change-password',
    method: 'put',
    data
  });
} 