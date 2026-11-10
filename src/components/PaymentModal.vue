<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  unit: any;
  isOpen: boolean;
  selectedMonth: string;
}>();

const emit = defineEmits(['close', 'record-payment', 'reverse-payment']);

const payAmount = ref('');
const payMethod = ref('mpesa');
const payRef = ref('');

const formatKSh = (amount: number) => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
};

const handleSave = () => {
  if (!payAmount.value) return;
  emit('record-payment', {
    unitId: props.unit.id,
    amount: parseFloat(payAmount.value),
    method: payMethod.value,
    reference: payRef.value || 'MPESA',
    month: props.selectedMonth,
  });
  payAmount.value = '';
  payRef.value = '';
};
</script>

<template>
  <div v-if="isOpen && unit" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
      
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-lg font-bold text-white">Payment Ledger: Unit {{ unit.unit_number }}</h3>
          <p class="text-xs text-slate-400">Tenant: <span class="text-slate-200 font-medium">{{ unit.tenant_name || 'Vacant' }}</span></p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white font-bold">✕</button>
      </div>

      <!-- Payment Form -->
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Amount (KSh)</label>
            <input v-model="payAmount" type="number" required placeholder="15000" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Channel</label>
            <select v-model="payMethod" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Wire</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase mb-1">Reference / Code</label>
          <input v-model="payRef" type="text" placeholder="QGH123456" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-mono uppercase text-white outline-none focus:border-indigo-500" />
        </div>
        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-600/20">
          Record Payment & Generate Receipt 💳
        </button>
      </form>

      <!-- Chronological History Timeline -->
      <div class="border-t border-slate-800 pt-4 space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">History for Cycle: {{ selectedMonth }}</h4>
        <div v-if="!unit.payments?.filter((p:any)=>p.month===selectedMonth).length" class="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-xl">
          No payments logged for this cycle.
        </div>
        <div v-else class="max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs">
          <div v-for="pay in unit.payments.filter((p:any)=>p.month===selectedMonth)" :key="pay.id" class="py-3 flex justify-between items-center" :class="{ 'line-through opacity-40': pay.is_reversed }">
            <div>
              <span class="font-bold text-white text-sm">{{ formatKSh(pay.amount) }}</span>
              <span class="text-slate-400 font-mono ml-2 uppercase bg-slate-800 px-2 py-0.5 rounded text-[10px]">{{ pay.method }}</span>
              <span class="text-slate-500 font-mono ml-2">{{ pay.reference }}</span>
              <p class="text-[10px] text-slate-500 mt-0.5">Receipt: {{ pay.receipt_number }}</p>
            </div>
            <button v-if="!pay.is_reversed" @click="emit('reverse-payment', pay.id)" class="text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20">
              Reverse
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>