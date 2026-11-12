<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';

// Reusable UI components
import MetricCard from '../components/ui/MetricCard.vue';
import StatusBadge from '../components/ui/StatusBadge.vue';
import FilterTabs from '../components/ui/FilterTabs.vue';
import ActionButton from '../components/ui/ActionButton.vue';

const { stats, processedUnits, financialSummary, selectedMonth } = useRentLedger();

// Filter status state ('ALL', 'PAID', 'DUE', 'VACANT')
const activeStatusFilter = ref('ALL');

// Computed tab configurations with live count badges
const filterTabs = computed(() => {
  let paid = 0;
  let due = 0;
  let vacant = 0;
  processedUnits.value.forEach(u => {
    if (u.status === 'VACANT') vacant++;
    else if (u.status === 'PAID') paid++;
    else due++; // covers DUE and PARTIAL
  });

  return [
    { label: 'All', value: 'ALL', count: processedUnits.value.length, activeColor: 'bg-blue-600 text-white shadow-md' },
    { label: 'Paid', value: 'PAID', count: paid, activeColor: 'bg-emerald-600 text-white shadow-md' },
    { label: 'Due', value: 'DUE', count: due, activeColor: 'bg-rose-600 text-white shadow-md' },
    { label: 'Vacant', value: 'VACANT', count: vacant, activeColor: 'bg-amber-600 text-white shadow-md' }
  ];
});

// Filtered units based on active status selection
const filteredRentRoll = computed(() => {
  if (activeStatusFilter.value === 'ALL') return processedUnits.value;
  if (activeStatusFilter.value === 'PAID') return processedUnits.value.filter(u => u.status === 'PAID');
  if (activeStatusFilter.value === 'DUE') return processedUnits.value.filter(u => u.status === 'DUE' || u.status === 'PARTIAL');
  if (activeStatusFilter.value === 'VACANT') return processedUnits.value.filter(u => u.status === 'VACANT');
  return processedUnits.value;
});

// Print Monthly Financial Statement
const printMonthlyStatement = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = processedUnits.value.map(u => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${u.property_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Unit ${u.unit_number}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${u.tenant_name || 'Vacant'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatKSh(u.rent_amount)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">${formatKSh(u.totalPaid)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${u.balanceDue > 0 ? '#dc2626' : '#64748b'};">${formatKSh(u.balanceDue)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${u.status}</td>
    </tr>
  `).join('');

  const content = `
    <html>
      <head>
        <title>Monthly Financial Statement - ${selectedMonth.value}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #0f172a; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
          .metric { font-size: 12px; color: #475569; }
          .metric strong { display: block; font-size: 16px; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
          th { background: #f1f5f9; padding: 10px 8px; border-bottom: 2px solid #cbd5e1; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>RENT LEDGER - MONTHLY FINANCIAL STATEMENT</h2>
            <p>Cycle: <strong>${selectedMonth.value}</strong> | Issued: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="metric">Occupancy Rate: <strong>${stats.value.occupancyRate}% (${stats.value.occupiedUnits}/${stats.value.totalUnits})</strong></div>
          <div class="metric">Gross Collected: <strong style="color: #16a34a;">${formatKSh(stats.value.totalCollected)}</strong></div>
          <div class="metric">Operating Expenses: <strong style="color: #dc2626;">${formatKSh(financialSummary.value.totalExpenses)}</strong></div>
          <div class="metric">Net Operating Income (NOI): <strong style="color: #2563eb;">${formatKSh(financialSummary.value.netOperatingIncome)}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Unit</th>
              <th>Tenant</th>
              <th>Rent Rate</th>
              <th>Collected</th>
              <th>Outstanding Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by Rent Ledger SaaS Engine • Confidential Financial Document</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};
</script>

<template>
  <div class="space-y-6">
    
    <!-- Action Header Bar -->
    <div class="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-base font-bold text-white tracking-tight">Executive Dashboard Overview</h2>
        <p class="text-xs text-slate-400">Monitor live collections, occupancy rates, and generate executive statements for cycle .</p>
      </div>
      <ActionButton variant="primary" @click="printMonthlyStatement">
         Print Monthly Statement
      </ActionButton>
    </div>

    <!-- 1. Top Summary Metric Cards (Clean & Declarative) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Total Collected" 
        :value="formatKSh(stats.totalCollected)" 
        :subtitle="`${stats.collectionRate}% collection rate`" 
        valueColor="text-emerald-400" 
      />
      <MetricCard 
        title="Outstanding Arrears" 
        :value="formatKSh(stats.totalOutstanding)" 
        subtitle="Unpaid cumulative balances" 
        valueColor="text-rose-400" 
      />
      <MetricCard 
        title="Occupancy Rate" 
        :value="`${stats.occupancyRate}%`" 
        :subtitle="`${stats.occupiedUnits} of ${stats.totalUnits} units occupied`" 
        valueColor="text-blue-400" 
      />
      <MetricCard 
        title="Portfolio Units" 
        :value="stats.totalUnits" 
        subtitle="Registered properties" 
        valueColor="text-white" 
      />
    </div>

    <!-- 2. Live Rent Roll Section -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      <!-- Header Bar with Filter Tabs -->
      <div class="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 class="font-bold text-white text-sm uppercase tracking-wider">Live Rent Roll & Cumulative Balances</h3>
          <p class="text-xs text-slate-400 font-medium">Real-time ledger tracking per tenant</p>
        </div>
        
        <!-- Reusable Filter Tabs Bar -->
        <FilterTabs v-model="activeStatusFilter" :tabs="filterTabs" />
      </div>

      <!-- Scrollable Unit List -->
      <div class="max-h-[420px] overflow-y-auto divide-y divide-slate-800">
        
        <div v-if="filteredRentRoll.length === 0" class="p-8 text-center text-sm text-slate-500 font-medium">
          No units found matching this status filter.
        </div>

        <div 
          v-for="unit in filteredRentRoll" 
          :key="unit.id" 
          class="px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/30 transition"
        >
          <!-- Unit & Tenant Metadata -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {{ unit.property_name }}
              </span>
              <span class="text-sm font-bold font-mono text-white">Unit {{ unit.unit_number }}</span>
              
              <!-- Reusable Status Badge -->
              <StatusBadge :status="unit.status" />
            </div>
            <p class="text-xs text-slate-300 font-medium">{{ unit.tenant_name || '— Vacant Unit —' }}</p>
          </div>

          <!-- Extended Financial Breakdown -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-right w-full md:w-auto">
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Monthly Rent</p>
              <p class="text-xs font-bold font-mono text-slate-200">{{ formatKSh(unit.rent_amount) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Carried Arrears</p>
              <p class="text-xs font-bold font-mono text-amber-400">{{ formatKSh(unit.carriedArrears || 0) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Paid this Month</p>
              <p class="text-xs font-bold font-mono text-emerald-400">{{ formatKSh(unit.totalPaid) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-500">Net Balance Due</p>
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