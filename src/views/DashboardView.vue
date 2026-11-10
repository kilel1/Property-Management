<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';

const { stats, processedUnits } = useRentLedger();

// Filter status state ('ALL', 'PAID', 'DUE', 'VACANT')
const activeStatusFilter = ref('ALL');

// Computed counts for the filter tabs
const counts = computed(() => {
  let paid = 0;
  let due = 0;
  let vacant = 0;
  processedUnits.value.forEach(u => {
    if (u.status === 'VACANT') vacant++;
    else if (u.status === 'PAID') paid++;
    else due++; // covers DUE and PARTIAL
  });
  return {
    all: processedUnits.value.length,
    paid,
    due,
    vacant,
  };
});

// Filtered units based on the selected card tab
const filteredRentRoll = computed(() => {
  if (activeStatusFilter.value === 'ALL') return processedUnits.value;
  if (activeStatusFilter.value === 'PAID') return processedUnits.value.filter(u => u.status === 'PAID');
  if (activeStatusFilter.value === 'DUE') return processedUnits.value.filter(u => u.status === 'DUE' || u.status === 'PARTIAL');
  if (activeStatusFilter.value === 'VACANT') return processedUnits.value.filter(u => u.status === 'VACANT');
  return processedUnits.value;
});
</script>

<template>
  <div class="space-y-6">
   <!-- 1. Top Summary Metric Cards (Fixed text sizing & spacing) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  
  <!-- Total Collected Card -->
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collected</p>
    <div class="my-2">
      <p class="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">{{ formatKSh(stats.totalCollected) }}</p>
    </div>
    <p class="text-xs text-slate-500">{{ stats.collectionRate }}% collection rate</p>
  </div>

  <!-- Outstanding Arrears Card -->
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Arrears</p>
    <div class="my-2">
      <p class="text-lg sm:text-xl font-bold font-mono text-rose-400 tracking-tight">{{ formatKSh(stats.totalOutstanding) }}</p>
    </div>
    <p class="text-xs text-slate-500">Unpaid balances due</p>
  </div>

  <!-- Occupancy Rate Card -->
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</p>
    <div class="my-2">
      <p class="text-lg sm:text-xl font-bold font-mono text-blue-400 tracking-tight">{{ stats.occupancyRate }}%</p>
    </div>
    <p class="text-xs text-slate-500">{{ stats.occupiedUnits }} of {{ stats.totalUnits }} units occupied</p>
  </div>

  <!-- Total Units Card -->
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio Units</p>
    <div class="my-2">
      <p class="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">{{ stats.totalUnits }}</p>
    </div>
    <p class="text-xs text-slate-500">Registered properties</p>
  </div>

</div>

    <!-- 2. Live Rent Roll Section with Clickable Filter Tabs -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      <!-- Header and Clickable Status Tabs Bar -->
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 class="font-bold text-white text-sm uppercase tracking-wider">Live Rent Roll</h3>
        
        <!-- Status Filter Buttons -->
        <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            @click="activeStatusFilter = 'ALL'" 
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
            :class="activeStatusFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            All ({{ counts.all }})
          </button>
          <button 
            @click="activeStatusFilter = 'PAID'" 
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
            :class="activeStatusFilter === 'PAID' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            Paid ({{ counts.paid }})
          </button>
          <button 
            @click="activeStatusFilter = 'DUE'" 
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
            :class="activeStatusFilter === 'DUE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            Due ({{ counts.due }})
          </button>
          <button 
            @click="activeStatusFilter = 'VACANT'" 
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
            :class="activeStatusFilter === 'VACANT' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            Vacant ({{ counts.vacant }})
          </button>
        </div>
      </div>

      <!-- Scrollable List for Long Lists -->
      <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-800">
        
        <div v-if="filteredRentRoll.length === 0" class="p-8 text-center text-sm text-slate-500 font-medium">
          No units found matching this status filter.
        </div>

        <div 
          v-for="unit in filteredRentRoll" 
          :key="unit.id" 
          class="px-6 py-4 flex items-center justify-between hover:bg-slate-900/30 transition"
        >
          <!-- Unit & Tenant Info -->
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {{ unit.property_name }}
              </span>
              <span class="text-sm font-bold font-mono text-white">Unit {{ unit.unit_number }}</span>
            </div>
            <p class="text-xs text-slate-300 font-medium">{{ unit.tenant_name || '— Vacant —' }}</p>
          </div>

          <!-- Financial Breakdown -->
          <div class="flex items-center gap-8 text-right">
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Rent</p>
              <p class="text-xs font-bold font-mono text-slate-200">{{ formatKSh(unit.rent_amount) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Paid</p>
              <p class="text-xs font-bold font-mono text-emerald-400">{{ formatKSh(unit.totalPaid) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Balance</p>
              <p class="text-xs font-bold font-mono" :class="unit.balanceDue > 0 ? 'text-rose-400' : 'text-slate-400'">
                {{ formatKSh(unit.balanceDue) }}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>