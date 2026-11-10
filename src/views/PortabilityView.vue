<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger } from '../composables/useRentLedger';

const { units } = useRentLedger();
const csvText = ref('');

const exportJSON = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(units.value, null, 2));
  const a = document.createElement('a'); a.href = dataStr; a.download = 'backup.json'; a.click();
};
</script>

<template>
  <div class="max-w-2xl mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6">
    <h2 class="text-xl font-bold text-white">Data Portability & Backup 📂</h2>
    <button @click="exportJSON" class="w-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 py-3 rounded-xl font-semibold">Download Backup (JSON) 📥</button>
    <div class="space-y-2">
      <label class="text-xs font-bold text-slate-400 uppercase">CSV Import Matrix</label>
      <textarea v-model="csvText" placeholder="unit_number,tenant_name,rent_amount,tenant_phone" class="w-full h-32 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white"></textarea>
    </div>
  </div>
</template>