<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import ToastContainer from './components/ToastContainer.vue';
import ProfileModal from './components/ProfileModal.vue';
import LoginView from './views/LoginView.vue';
import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { useProfile } from './composables/useProfile';
import { useAuth } from './composables/useAuth';

const route = useRoute();
const { profile } = useProfile();
const { isAuthenticated } = useAuth();

const isProfileModalOpen = ref(false);

// Force login view if not authenticated OR path is /login
const showLogin = computed(() => !isAuthenticated.value || route.path === '/login');

const notifications = ref([
  { id: 1, title: 'Unpaid Rent Alert', time: '10m ago', text: 'Unit A1 balance overdue by KSh 25,000.', type: 'warning' },
  { id: 2, title: 'Payment Logged', time: '1h ago', text: 'Unit A2 recorded payment via M-Pesa.', type: 'success' },
  { id: 3, title: 'System Local Backup', time: '3h ago', text: 'All units saved to local storage.', type: 'info' }
]);

const unreadCount = computed(() => notifications.value.length);

const currentPathName = computed(() => {
  if (route.path === '/') return 'Dashboard';
  if (route.path === '/units') return 'Units Directory';
  if (route.path === '/payments') return 'Payments & Receipts';
  if (route.path === '/portability') return 'Data Portability';
  return 'Overview';
});
</script>

<template>
  <!-- Direct Login View Render if unauthenticated -->
  <div v-if="showLogin" class="min-h-screen bg-slate-950 w-full">
    <LoginView />
    <ToastContainer />
  </div>

  <!-- Authenticated Dashboard Shell -->
  <div v-else class="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased w-full">
    
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      
      <header class="bg-slate-950/70 border-b border-slate-800 px-8 py-3.5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-md">
        
        <div class="flex items-center text-xs font-medium text-slate-400 gap-2">
          <span class="hover:text-slate-200 cursor-pointer">Home</span>
          <span>/</span>
          <span class="text-white font-semibold">{{ currentPathName }}</span>
        </div>

        <div class="flex items-center gap-5">
          <button
            type="button"
            class="relative p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:text-white transition"
            aria-label="View notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white"
            >
              {{ unreadCount }}
            </span>
          </button>

          <div class="h-6 w-px bg-slate-800"></div>

          <button 
            @click="isProfileModalOpen = true" 
            class="flex items-center gap-3 group text-right focus:outline-none bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-1.5 pr-3 rounded-2xl transition"
          >
            <div class="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30 group-hover:scale-105 transition">
              {{ profile.initials }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-bold text-white leading-tight group-hover:text-blue-400 transition">{{ profile.name }}</p>
              <p class="text-[10px] text-slate-400 font-medium">{{ profile.role }}</p>
            </div>
          </button>
        </div>
      </header>

      <main class="p-8 flex-1 max-w-7xl w-full mx-auto">
        <router-view />
      </main>

    </div>

    <ProfileModal :isOpen="isProfileModalOpen" @close="isProfileModalOpen = false" />
    <ToastContainer />
  </div>
</template>