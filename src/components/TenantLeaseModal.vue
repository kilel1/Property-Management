<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Unit } from '../composables/useRentLedger';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import ActionButton from './ui/ActionButton.vue';

const props = defineProps<{
  isOpen: boolean;
  unit: Unit | null;
}>();

const emit = defineEmits(['close']);

const { moveInTenant, moveOutTenant } = useRentLedger();

const tenantName = ref('');
const tenantPhone = ref('');
const depositAmount = ref(0);

watch(() => props.unit, (newUnit) => {
  if (newUnit) {
    tenantName.value = newUnit.tenant_name || '';
    tenantPhone.value = newUnit.tenant_phone || '';
    depositAmount.value = newUnit.deposit_amount || newUnit.rent_amount; // Default deposit to 1 month rent
  }
});

const handleMoveInSubmit = () => {
  if (!props.unit) return;
  if (!tenantName.value || !tenantPhone.value) {
    alert('Please provide both tenant name and phone number.');
    return;
  }

  moveInTenant(props.unit.id, {
    tenant_name: tenantName.value,
    tenant_phone: tenantPhone.value,
    deposit_amount: Number(depositAmount.value),
  });

  emit('close');
};

const handleCheckOut = () => {
  if (!props.unit) return;
  const deposit = props.unit.deposit_amount || 0;
  
  if (confirm(`Are you sure you want to check out ${props.unit.tenant_name}? Security deposit refund due: ${formatKSh(deposit)} (minus any outstanding arrears).`)) {
    moveOutTenant(props.unit.id);
    emit('close');
  }
};
</script>

<template>
  <div v-if="isOpen && unit" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
      
      <!-- Header -->
      <div class="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
            {{ unit.property_name }}
          </span>
          <h3 class="text-lg font-bold font-mono text-white mt-1">Lease Management: Unit {{ unit.unit_number }}</h3>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      <!-- IF VACANT: Show Move-In Form -->
      <div v-if="unit.is_vacant" class="space-y-4">
        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
          This unit is currently vacant. Fill out the details below to onboard a new tenant.
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Tenant Full Name</label>
            <input 
              v-model="tenantName" 
              type="text" 
              placeholder="e.g. Kevin Otieno" 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Phone Number (WhatsApp)</label>
            <input 
              v-model="tenantPhone" 
              type="text" 
              placeholder="e.g. +254712345678" 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Security Deposit Held (KSh)</label>
            <input 
              v-model.number="depositAmount" 
              type="number" 
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div class="pt-3 flex justify-end gap-2">
          <ActionButton variant="outline" @click="emit('close')">Cancel</ActionButton>
          <ActionButton variant="primary" @click="handleMoveInSubmit">Confirm Move-In</ActionButton>
        </div>
      </div>

      <!-- IF OCCUPIED: Show Active Lease Details & Move-Out Action -->
      <div v-else class="space-y-4">
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-400">Current Tenant:</span>
            <span class="font-bold text-white">{{ unit.tenant_name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Phone:</span>
            <span class="font-mono text-slate-300">{{ unit.tenant_phone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Deposit Held:</span>
            <span class="font-mono text-emerald-400 font-bold">{{ formatKSh(unit.deposit_amount || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Lease Started:</span>
            <span class="font-mono text-slate-300">{{ unit.lease_start || 'N/A' }}</span>
          </div>
        </div>

        <div class="pt-2 flex flex-col gap-2">
          <button 
            @click="handleCheckOut"
            class="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-semibold transition text-center"
          >
            Process Tenant Move-Out & Clear Lease
          </button>
          <ActionButton variant="outline" fullWidth @click="emit('close')">Close Window</ActionButton>
        </div>
      </div>

    </div>
  </div>
</template>