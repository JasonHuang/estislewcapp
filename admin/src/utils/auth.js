// 用于管理Token的工具函数

// Token存储的key名称
const TokenKey = 'Admin-Token';

/**
 * 从localStorage获取Token
 * @returns {string} 存储的Token
 */
export function getToken() {
  return localStorage.getItem(TokenKey);
}

/**
 * 将Token保存到localStorage
 * @param {string} token 要保存的Token
 */
export function setToken(token) {
  return localStorage.setItem(TokenKey, token);
}

/**
 * 从localStorage中移除Token
 */
export function removeToken() {
  return localStorage.removeItem(TokenKey);
} 