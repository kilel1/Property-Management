import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UnitsView from '../views/UnitsView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import PortabilityView from '../views/PortabilityView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/units', name: 'Units', component: UnitsView },
  { path: '/payments', name: 'Payments', component: PaymentsView },
  { path: '/portability', name: 'Portability', component: PortabilityView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});