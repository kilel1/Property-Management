import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UnitsView from '../views/UnitsView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import RemindersView from '../views/RemindersView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
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
    path: '/expenses',
    name: 'Expenses',
    component: ExpensesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: RemindersView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isAuth = localStorage.getItem('rent_ledger_authenticated') === 'true';
  
  let role = 'admin';
  try {
    const storedUser = JSON.parse(localStorage.getItem('rent_ledger_user') || '{}');
    if (storedUser?.role) role = storedUser.role;
  } catch {}

  const allowedRoles = to.meta.allowedRoles as string[] | undefined;

  if (to.meta.requiresAuth && !isAuth) {
    next('/login');
  } else if (to.path === '/login' && isAuth) {
    next('/');
  } else if (allowedRoles && !allowedRoles.includes(role)) {
    // Bounce unauthorized roles back to Dashboard
    next('/');
  } else {
    next();
  }
});

export default router;