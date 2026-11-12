<script setup lang="ts">
import { computed } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';
import StatusBadge from '../components/ui/StatusBadge.vue';

const { processedUnits, selectedMonth } = useRentLedger();
const { addToast } = useToast();

// Filter only units that have an active tenant and a balance due
const tenantsInArrears = computed(() => {
  return processedUnits.value.filter(u => !u.is_vacant && u.balanceDue > 0);
});

// Generate WhatsApp Direct Link
const getWhatsAppLink = (phone: string, tenantName: string, unitNum: string, balance: number) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Hello ${tenantName}, this is a friendly reminder from Rent Ledger regarding your rent balance for Unit ${unitNum} (${selectedMonth.value}). Current balance due is ${formatKSh(balance)}. Please clear via M-Pesa at your earliest convenience. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// Copy SMS Template to Clipboard
const copySmsTemplate = (tenantName: string, unitNum: string, balance: number) => {
  const message = `Hi ${tenantName}, friendly reminder: Rent balance for Unit ${unitNum} for ${selectedMonth.value} is ${formatKSh(balance)}. Please clear promptly. Thank you!`;
  navigator.clipboard.writeText(message);
  addToast('Copied', `SMS reminder template copied for ${tenantName}`, 'success');
};
</script>

<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-base font-bold text-white tracking-tight">Automated Reminders & Messaging</h2>
        <p class="text-xs text-slate-400">Quickly broadcast WhatsApp alerts or copy SMS templates for tenants with outstanding balances.</p>
      </div>
      <div class="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
        Cycle: <span class="text-blue-400 font-bold">{{ selectedMonth }}</span>
      </div>
    </div>

    <!-- Tenants in Arrears List -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white tracking-tight">Pending Balance Notifications</h3>
        <span class="text-xs font-mono text-rose-400 font-semibold">{{ tenantsInArrears.length }} Tenants with Arrears</span>
      </div>

      <div v-if="tenantsInArrears.length === 0" class="py-12 text-center text-sm text-slate-500 font-medium">
        Awesome! All occupied units are fully paid for this billing cycle. No reminders needed.
      </div>

      <div class="divide-y divide-slate-800">
        <div 
          v-for="unit in tenantsInArrears" 
          :key="unit.id"
          class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white">{{ unit.property_name }} - Unit {{ unit.unit_number }}</span>
              <StatusBadge :status="unit.status" />
            </div>
            <p class="text-xs text-slate-300 font-medium">
              Tenant: <span class="text-white">{{ unit.tenant_name }}</span> | Phone: <span class="font-mono text-slate-400">{{ unit.tenant_phone || 'No Phone' }}</span>
            </p>
            <p class="text-xs font-mono text-rose-400 font-bold">
              Balance Due: {{ formatKSh(unit.balanceDue) }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2.5">
            <button 
              @click="copySmsTemplate(unit.tenant_name || 'Tenant', unit.unit_number, unit.balanceDue)"
              class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              📋 Copy SMS
            </button>

            <a 
              :href="getWhatsAppLink(unit.tenant_phone || '', unit.tenant_name || 'Tenant', unit.unit_number, unit.balanceDue)"
              target="_blank"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              💬 WhatsApp Alert
            </a>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>