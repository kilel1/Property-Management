import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UnitsView from '../views/UnitsView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import RemindersView from '../views/RemindersView.vue';
import PortabilityView from '../views/PortabilityView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/units', name: 'Units', component: UnitsView },
  { path: '/payments', name: 'Payments', component: PaymentsView },
  { path: '/expenses', name: 'Expenses', component: ExpensesView },
  { path: '/reminders', name: 'Reminders', component: RemindersView },
  { path: '/portability', name: 'Portability', component: PortabilityView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});