<script setup lang="ts">
defineProps<{
  receipt: {
    receipt_number: string;
    tenantName: string;
    unitNumber: string;
    amount: number;
    method: string;
    reference: string;
    month: string;
    date: string;
  } | null;
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const formatKSh = (amount: number) => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
};

const printReceipt = () => window.print();
</script>

<template>
  <div v-if="isOpen && receipt" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 relative overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500"></div>

      <div class="text-center border-b border-slate-200 pb-4 space-y-1">
        <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-800 mb-1 font-bold text-lg">🏢</div>
        <h3 class="text-xl font-black uppercase tracking-wider text-slate-900">Official Rent Receipt</h3>
        <p class="text-xs font-mono text-slate-500 tracking-wide">{{ receipt.receipt_number }}</p>
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-500">Tenant Name:</span> <span class="font-bold text-slate-800">{{ receipt.tenantName || 'N/A' }}</span></div>
        <div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-500">Property Unit:</span> <span class="font-bold text-slate-800">Unit {{ receipt.unitNumber }}</span></div>
        <div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-500">Channel:</span> <span class="uppercase font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded">{{ receipt.method }}</span></div>
        <div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-500">Reference:</span> <span class="font-mono font-bold text-slate-700 text-xs">{{ receipt.reference }}</span></div>
        <div class="flex justify-between py-1 border-b border-slate-100"><span class="text-slate-500">Billing Cycle:</span> <span class="font-bold text-slate-800">{{ receipt.month }}</span></div>
        
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center mt-4">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Amount Paid:</span>
          <span class="text-xl font-black text-emerald-600">{{ formatKSh(receipt.amount) }}</span>
        </div>
      </div>

      <div class="flex gap-3 pt-2 print:hidden">
        <button @click="printReceipt" class="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md">Print / PDF 🖨️</button>
        <button @click="emit('close')" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 rounded-xl font-semibold text-sm transition">Close</button>
      </div>
    </div>
  </div>
</template>