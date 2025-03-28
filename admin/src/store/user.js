import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login, logout } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value.role || '');

  async function loginUser(credentials) {
    try {
      const response = await login(credentials);
      token.value = response.token;
      user.value = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function logoutUser() {
    try {
      await logout();
      token.value = '';
      user.value = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    loginUser,
    logoutUser
  };
}); 