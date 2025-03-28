import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'banners',
        name: 'Banners',
        component: () => import('@/views/banners/List.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/List.vue')
      },
      {
        path: 'products/create',
        name: 'CreateProduct',
        component: () => import('@/views/products/Form.vue')
      },
      {
        path: 'products/:id/edit',
        name: 'EditProduct',
        component: () => import('@/views/products/Form.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/List.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !userStore.isAuthenticated) {
    next('/login');
  } else if (requiresAdmin && userStore.userRole !== 'admin') {
    next('/');
  } else {
    next();
  }
});

export default router; 