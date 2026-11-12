<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';
import ActionButton from '../components/ui/ActionButton.vue';
import MetricCard from '../components/ui/MetricCard.vue';

const { properties, expenses, addExpense, deleteExpense, financialSummary, selectedMonth } = useRentLedger();
const { addToast } = useToast();

const propertyName = ref(properties.value[0] || 'Property A');
const unitNumber = ref('');
const category = ref<'Plumbing' | 'Electrical' | 'Repairs' | 'Utilities' | 'Payroll' | 'Other'>('Repairs');
const amount = ref('');
const description = ref('');

const handleAddExpense = () => {
  if (!amount.value || Number(amount.value) <= 0 || !description.value.trim()) {
    addToast('Error', 'Please enter a valid amount and description', 'error');
    return;
  }

  addExpense({
    property_name: propertyName.value,
    unit_number: unitNumber.value.trim() || undefined,
    category: category.value,
    amount: Number(amount.value),
    description: description.value.trim(),
    month: selectedMonth.value,
  });

  addToast('Success', 'Expense logged successfully', 'success');
  amount.value = '';
  description.value = '';
  unitNumber.value = '';
};
</script>

<template>
  <div class="space-y-6">
    
    <!-- P&L Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard 
        title="Gross Collection" 
        :value="formatKSh(financialSummary.grossCollected)" 
        subtitle="Total rent collected this cycle" 
        valueColor="text-emerald-400" 
      />
      <MetricCard 
        title="Operating Expenses" 
        :value="formatKSh(financialSummary.totalExpenses)" 
        subtitle="Maintenance & bills outflow" 
        valueColor="text-rose-400" 
      />
      <MetricCard 
        title="Net Operating Income" 
        :value="formatKSh(financialSummary.netOperatingIncome)" 
        subtitle="True cash flow (NOI)" 
        valueColor="text-blue-400" 
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Log Expense Form -->
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-white tracking-tight">Log Maintenance / Expense</h3>
        
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Property Name</label>
            <select v-model="propertyName" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500">
              <option v-for="p in properties" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Unit Number (Optional)</label>
            <input v-model="unitNumber" placeholder="e.g. A1" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
            <select v-model="category" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500">
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Repairs">Repairs & Maintenance</option>
              <option value="Utilities">Utilities</option>
              <option value="Payroll">Payroll / Caretaker</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Amount (KSh)</label>
            <input v-model="amount" type="number" placeholder="e.g. 3500" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description / Notes</label>
            <input v-model="description" placeholder="e.g. Replaced gate latch" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500" />
          </div>

          <ActionButton variant="primary" fullWidth @click="handleAddExpense">
            Save Expense
          </ActionButton>
        </div>
      </div>

      <!-- Expenses Ledger List -->
      <div class="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white tracking-tight">Expense Records ({{ selectedMonth }})</h3>
          <span class="text-xs font-mono text-slate-400">Total Outflow: {{ formatKSh(financialSummary.totalExpenses) }}</span>
        </div>

        <div class="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
          <div v-if="expenses.filter(e => e.month === selectedMonth).length === 0" class="py-12 text-center text-sm text-slate-500 font-medium">
            No expenses recorded for this billing cycle.
          </div>

          <div 
            v-for="exp in expenses.filter(e => e.month === selectedMonth)" 
            :key="exp.id" 
            class="py-3.5 flex justify-between items-center"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">{{ exp.property_name }} <span v-if="exp.unit_number">— Unit {{ exp.unit_number }}</span></span>
                <span class="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {{ exp.category }}
                </span>
              </div>
              <p class="text-xs text-slate-400">{{ exp.description }}</p>
              <p class="text-[10px] text-slate-500 font-mono">{{ exp.date }}</p>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-sm font-bold font-mono text-rose-400">-{{ formatKSh(exp.amount) }}</span>
              <button @click="deleteExpense(exp.id)" class="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg transition font-semibold border border-rose-500/20">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>