<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import BillingCyclePicker from './BillingCyclePicker.vue';

const router = useRouter();
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<template>
  <aside class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
    <div class="p-4 space-y-6">
      
      <!-- Brand Header -->
      <div class="flex items-center space-x-3 px-2 pt-1">
        <div class="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-sm shadow-md shadow-blue-600/30 text-white font-bold">
          BL
        </div>
        <div>
          <h1 class="text-sm font-bold text-white tracking-tight">Rent Ledger</h1>
          <p class="text-[10px] text-slate-400 font-medium">Admin Workspace</p>
        </div>
      </div>

      <!-- Navigation Section -->
      <div class="space-y-1">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
        
        <router-link 
          to="/" 
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition group" 
          active-class="!bg-blue-600 !text-white font-bold shadow-lg shadow-blue-600/30"
        >
          Dashboard
        </router-link>

        <router-link 
          to="/units" 
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition group" 
          active-class="!bg-blue-600 !text-white font-bold shadow-lg shadow-blue-600/30"
        >
          Units Directory
        </router-link>

        <router-link 
          to="/payments" 
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition group" 
          active-class="!bg-blue-600 !text-white font-bold shadow-lg shadow-blue-600/30"
        >
          Payments & Receipts
        </router-link>

        <router-link 
          to="/portability" 
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition group" 
          active-class="!bg-blue-600 !text-white font-bold shadow-lg shadow-blue-600/30"
        >
          Data Portability
        </router-link>
      </div>

    </div>

    <!-- Bottom Actions: Custom Billing Cycle Picker & Logout -->
    <div class="p-4 border-t border-slate-900 bg-slate-950/50 space-y-3">
      
      <!-- Custom Picker Component -->
      <BillingCyclePicker />

      <button 
        @click="handleLogout" 
        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition"
      >
        Sign Out
      </button>
    </div>
  </aside>
</template>