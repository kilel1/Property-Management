<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRentLedger } from '../composables/useRentLedger';

const { selectedMonth } = useRentLedger(); // Expected format: "YYYY-MM" (e.g., "2026-11")

const isOpen = ref(false);

// Parse current selectedMonth or default to now
const [currentYearStr] = selectedMonth.value.split('-');
const activeYear = ref(parseInt(currentYearStr) || new Date().getFullYear());

const months = [
  { name: 'Jan', value: '01' },
  { name: 'Feb', value: '02' },
  { name: 'Mar', value: '03' },
  { name: 'Apr', value: '04' },
  { name: 'May', value: '05' },
  { name: 'Jun', value: '06' },
  { name: 'Jul', value: '07' },
  { name: 'Aug', value: '08' },
  { name: 'Sep', value: '09' },
  { name: 'Oct', value: '10' },
  { name: 'Nov', value: '11' },
  { name: 'Dec', value: '12' },
];

// Formatted label for the trigger button (e.g., "November 2026")
const formattedDisplay = computed(() => {
  if (!selectedMonth.value) return 'Select Cycle';
  const [y, m] = selectedMonth.value.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const selectMonth = (monthValue: string) => {
  selectedMonth.value = `${activeYear.value}-${monthValue}`;
  isOpen.value = false;
};

const changeYear = (delta: number) => {
  activeYear.value += delta;
};
</script>

<template>
  <div class="relative">
    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Billing Cycle</label>
    
    <!-- Trigger Button -->
    <button 
      @click="isOpen = !isOpen" 
      class="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-blue-400 flex items-center justify-between transition shadow-sm outline-none"
    >
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ formattedDisplay }}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-500 transition-transform" :class="isOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Custom Popover Dropdown Calendar -->
    <div 
      v-if="isOpen" 
      class="absolute bottom-full left-0 mb-2 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3 animate-in fade-in duration-150"
    >
      <!-- Year Switcher Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <button @click="changeYear(-1)" class="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition">
          ◀
        </button>
        <span class="text-xs font-bold font-mono text-white tracking-wider">{{ activeYear }}</span>
        <button @click="changeYear(1)" class="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition">
          ▶
        </button>
      </div>

      <!-- Month Grid Selector -->
      <div class="grid grid-cols-3 gap-1.5">
        <button 
          v-for="m in months" 
          :key="m.value"
          @click="selectMonth(m.value)"
          class="py-2 rounded-xl text-xs font-bold transition text-center"
          :class="selectedMonth === `${activeYear}-${m.value}` ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 bg-slate-900/50 hover:bg-slate-900 hover:text-white'"
        >
          {{ m.name }}
        </button>
      </div>
    </div>
  </div>
</template>