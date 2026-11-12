<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';
import ActionButton from '../components/ui/ActionButton.vue';

const { units, recordPayment, reversePayment, selectedMonth } = useRentLedger();
const { addToast } = useToast();

const selectedUnitId = ref('');
const amount = ref('');
const method = ref('mpesa');
const reference = ref('');

// Payment form validation errors
const payErrors = ref({
  unitId: '',
  amount: '',
  reference: '',
});

const handlePay = () => {
  payErrors.value = { unitId: '', amount: '', reference: '' };
  
  let isValid = true;
  if (!selectedUnitId.value) {
    payErrors.value.unitId = 'Property unit required';
    isValid = false;
  }
  if (!amount.value) {
    payErrors.value.amount = 'Amount required';
    isValid = false;
  }
  if (!reference.value.trim()) {
    payErrors.value.reference = 'Reference code required';
    isValid = false;
  }

  if (!isValid) return;

  recordPayment(selectedUnitId.value, { 
    amount: parseFloat(amount.value), 
    method: method.value, 
    reference: reference.value 
  });

  addToast('Success', 'Payment recorded successfully', 'success');
  amount.value = '';
  reference.value = '';
  selectedUnitId.value = '';
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Log Payment Form -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <h3 class="text-base font-bold text-white tracking-tight">Record Rent Payment</h3>
      <div class="space-y-3.5">
        
        <!-- Property Unit Dropdown -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Property Unit</label>
          <select 
            v-model="selectedUnitId" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm text-white outline-none transition" 
            :class="payErrors.unitId ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'"
          >
            <option value="" disabled>Select Property Unit</option>
            <option v-for="u in units.filter(u => !u.is_vacant)" :key="u.id" :value="u.id">
              {{ u.property_name }} - Unit {{ u.unit_number }} ({{ u.tenant_name }})
            </option>
          </select>
          <span v-if="payErrors.unitId" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ payErrors.unitId }}</span>
        </div>

        <!-- Amount Input -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Amount (KSh)</label>
          <input 
            v-model="amount" 
            type="number" 
            placeholder="e.g. 25000" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm text-white outline-none transition" 
            :class="payErrors.amount ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" 
          />
          <span v-if="payErrors.amount" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ payErrors.amount }}</span>
        </div>

        <!-- Payment Method Dropdown -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method</label>
          <select 
            v-model="method" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="mpesa">M-Pesa (Daraja)</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <!-- Reference Code Input -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Reference Code</label>
          <input 
            v-model="reference" 
            placeholder="e.g. QHX892L1K" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm font-mono uppercase text-white outline-none transition" 
            :class="payErrors.reference ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" 
          />
          <span v-if="payErrors.reference" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ payErrors.reference }}</span>
        </div>

        <!-- Reusable Action Button -->
        <ActionButton variant="success" fullWidth @click="handlePay">
          Save Payment
        </ActionButton>

      </div>
    </div>

    <!-- Payments Ledger Log -->
    <div class="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white tracking-tight">Payment Transactions</h3>
        <span class="text-xs text-slate-400 font-mono">Cycle: {{ selectedMonth }}</span>
      </div>

      <div class="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
        
        <div v-if="!units.some(u => (u.payments || []).some(p => p.month === selectedMonth))" class="py-12 text-center text-sm text-slate-500 font-medium">
          No payment transactions recorded for this billing cycle.
        </div>

        <template v-for="unit in units" :key="unit.id">
          <div 
            v-for="pay in (unit.payments || []).filter(p => p.month === selectedMonth)" 
            :key="pay.id" 
            class="py-3.5 flex justify-between items-center transition"
            :class="{'opacity-40 line-through': pay.is_reversed}"
          >
            <div>
              <p class="text-sm font-bold text-white">
                {{ unit.property_name }} - Unit {{ unit.unit_number }} — <span class="text-emerald-400">{{ formatKSh(pay.amount) }}</span>
              </p>
              <p class="text-xs text-slate-400 font-mono mt-0.5">
                {{ pay.receipt_number }} | {{ pay.method.toUpperCase() }} | Ref: {{ pay.reference }} | Date: {{ pay.date }}
              </p>
            </div>
            
            <button 
              v-if="!pay.is_reversed" 
              @click="reversePayment(unit.id, pay.id)" 
              class="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition font-semibold"
            >
              Reverse
            </button>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>