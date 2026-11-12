<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import ToastContainer from './components/ToastContainer.vue';
import ProfileModal from './components/ProfileModal.vue';
import CommandPaletteModal from './components/CommandPaletteModal.vue';
import LoginView from './views/LoginView.vue';
import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { useProfile } from './composables/useProfile';
import { useAuth } from './composables/useAuth';

const route = useRoute();
const { profile } = useProfile();
const { isAuthenticated } = useAuth();

const isMobileSidebarOpen = ref(false);
const isProfileModalOpen = ref(false);
const isCommandPaletteOpen = ref(false);

const showLogin = computed(() => !isAuthenticated.value || route.path === '/login');

const currentPathName = computed(() => {
  if (route.path === '/') return 'Dashboard';
  if (route.path === '/units') return 'Units Directory';
  if (route.path === '/payments') return 'Payments & Receipts';
  if (route.path === '/expenses') return 'Expenses & Operating Costs';
  if (route.path === '/reminders') return 'Tenant Reminders';
  if (route.path === '/portability') return 'Data Portability';
  return 'Overview';
});
</script>

<template>
  <div v-if="showLogin" class="min-h-screen bg-slate-950 w-full">
    <LoginView />
    <ToastContainer />
  </div>

  <div v-else class="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased w-full">
    
    <Sidebar :isOpen="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      
      <!-- Top Navbar Header -->
      <header class="bg-slate-950/70 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-md">
        
        <div class="flex items-center gap-3">
          <button 
            @click="isMobileSidebarOpen = true" 
            class="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center text-xs font-medium text-slate-400 gap-2">
            <span class="hidden sm:inline">Home</span>
            <span class="hidden sm:inline">/</span>
            <span class="text-white font-semibold">{{ currentPathName }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Search Trigger Button -->
          <button 
            @click="isCommandPaletteOpen = true"
            class="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400 transition cursor-pointer"
          >
            <span> Search</span>
            <kbd class="font-mono text-[10px] bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">Cmd K</kbd>
          </button>

          <!-- Profile Button -->
          <button 
            @click="isProfileModalOpen = true" 
            class="flex items-center gap-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 p-1.5 pr-3 rounded-2xl transition"
          >
            <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30">
              {{ profile.initials }}
            </div>
            <p class="text-xs font-bold text-white hidden sm:block">{{ profile.name }}</p>
          </button>
        </div>

      </header>

      <main class="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
        <router-view />
      </main>

    </div>

    <!-- Global Modals -->
    <CommandPaletteModal :isOpen="isCommandPaletteOpen" @close="isCommandPaletteOpen = false" />
    <ProfileModal :isOpen="isProfileModalOpen" @close="isProfileModalOpen = false" />
    <ToastContainer />
  </div>
</template>