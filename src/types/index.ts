import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UnitsView from '../views/UnitsView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import PortabilityView from '../views/PortabilityView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/units',
      name: 'Units',
      component: UnitsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/payments',
      name: 'Payments',
      component: PaymentsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/portability',
      name: 'Portability',
      component: PortabilityView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const isAuth = localStorage.getItem('rent_ledger_authenticated') === 'true';
  if (to.meta.requiresAuth && !isAuth) {
    next('/login');
  } else if (to.path === '/login' && isAuth) {
    next('/');
  } else {
    next();
  }
});

export default router;