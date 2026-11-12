<script setup lang="ts">
import { computed } from 'vue';
import type { Unit, Payment } from '../composables/useRentLedger';
import { formatKSh, useRentLedger } from '../composables/useRentLedger';
import StatusBadge from './ui/StatusBadge.vue';
import ActionButton from './ui/ActionButton.vue';

const props = defineProps<{
  isOpen: boolean;
  unit: Unit | null;
}>();

const emit = defineEmits(['close']);

const { processedUnits, reversePayment, selectedMonth } = useRentLedger();

// Find the corresponding processed unit to get dynamic fields (totalPaid, balanceDue, status)
const currentProcessedUnit = computed(() => {
  if (!props.unit) return null;
  return processedUnits.value.find(u => u.id === props.unit?.id) || null;
});

// Active cycle payments sorted newest first
const activeMonthPayments = computed(() => {
  if (!props.unit || !props.unit.payments) return [];
  return props.unit.payments.filter(p => p.month === selectedMonth.value);
});

// Print single receipt function
const printReceipt = (payment: Payment) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow || !props.unit) return;

  const content = `
    <html>
      <head>
        <title>Rent Receipt - ${payment.receipt_number}</title>
        <style>
          body { font-family: monospace; padding: 20px; color: #1e293b; }
          .receipt { border: 2px dashed #0f172a; padding: 20px; max-width: 400px; margin: auto; }
          .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .total { border-top: 2px solid #0f172a; padding-top: 8px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>RENT LEDGER RECEIPT</h2>
            <p>Receipt Ref: <strong>${payment.receipt_number}</strong></p>
          </div>
          <div class="row"><span>Property:</span> <span>${props.unit.property_name}</span></div>
          <div class="row"><span>Unit:</span> <span>Unit ${props.unit.unit_number}</span></div>
          <div class="row"><span>Tenant:</span> <span>${props.unit.tenant_name || 'N/A'}</span></div>
          <div class="row"><span>Date:</span> <span>${payment.date}</span></div>
          <div class="row"><span>Method:</span> <span>${payment.method.toUpperCase()} (${payment.reference})</span></div>
          <div class="row total"><span>Amount Paid:</span> <span>${formatKSh(payment.amount)}</span></div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Rent Ledger SaaS Engine</p>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

const handleReverse = (paymentId: string, receiptNum: string) => {
  if (!props.unit) return;
  if (confirm(`Are you sure you want to reverse payment receipt ${receiptNum}?`)) {
    reversePayment(props.unit.id, paymentId);
  }
};
</script>

<template>
  <div v-if="isOpen && unit" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
              {{ unit.property_name }}
            </span>
            <StatusBadge v-if="currentProcessedUnit" :status="currentProcessedUnit.status" />
          </div>
          <h3 class="text-xl font-bold font-mono text-white mt-1">Unit {{ unit.unit_number }} Ledger & Installments</h3>
          <p class="text-xs text-slate-400">Tenant: <span class="text-white font-semibold">{{ unit.tenant_name || 'Vacant' }}</span></p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      <!-- Financial Snapshot Cards -->
      <div v-if="currentProcessedUnit" class="grid grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 block">Monthly Rent</span>
          <span class="text-sm font-mono font-bold text-white">{{ formatKSh(unit.rent_amount) }}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 block">Total Paid</span>
          <span class="text-sm font-mono font-bold text-emerald-400">{{ formatKSh(currentProcessedUnit.totalPaid) }}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 block">Balance Remaining</span>
          <span class="text-sm font-mono font-bold" :class="currentProcessedUnit.balanceDue > 0 ? 'text-rose-400' : 'text-slate-400'">
            {{ formatKSh(currentProcessedUnit.balanceDue) }}
          </span>
        </div>
      </div>

      <!-- Installments History Timeline -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Installments History ({{ selectedMonth }})</h4>
        
        <div v-if="activeMonthPayments.length === 0" class="py-8 text-center text-xs text-slate-500">
          No payment transactions recorded for this cycle yet.
        </div>

        <div class="space-y-2.5">
          <div 
            v-for="payment in activeMonthPayments" 
            :key="payment.id"
            class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4 transition"
            :class="payment.is_reversed ? 'opacity-50 line-through bg-rose-950/10 border-rose-900/30' : ''"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-emerald-400">+ {{ formatKSh(payment.amount) }}</span>
                <span class="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">{{ payment.method }}</span>
                <span v-if="payment.is_reversed" class="text-[10px] font-bold text-rose-400 uppercase">[Reversed]</span>
              </div>
              <p class="text-[11px] font-mono text-slate-400">
                Ref: <span class="text-slate-200">{{ payment.reference }}</span> | Rec #: <span class="text-slate-200">{{ payment.receipt_number }}</span> | {{ payment.date }}
              </p>
            </div>

            <!-- Receipt Actions -->
            <div v-if="!payment.is_reversed" class="flex items-center gap-2">
              <button 
                @click="printReceipt(payment)"
                class="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/20 transition flex items-center gap-1"
              >
                🖨️ Receipt
              </button>
              <button 
                @click="handleReverse(payment.id, payment.receipt_number)"
                class="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/20 transition"
              >
                Reverse
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-slate-800 flex justify-end">
        <ActionButton variant="outline" @click="emit('close')">Close Ledger</ActionButton>
      </div>

    </div>
  </div>
</template>