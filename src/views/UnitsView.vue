<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import type { Unit } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';

// Reusable UI Components
import StatusBadge from '../components/ui/StatusBadge.vue';
import FilterTabs from '../components/ui/FilterTabs.vue';
import ActionButton from '../components/ui/ActionButton.vue';
import TenantHistoryModal from '../components/TenantHistoryModal.vue';
import CsvImportModal from '../components/CsvImportModal.vue';

const { processedUnits, properties, addUnit, updateUnit, deleteUnit } = useRentLedger();
const { addToast } = useToast();

// Modal & Selection States
const isHistoryModalOpen = ref(false);
const selectedUnitForHistory = ref<Unit | null>(null);

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isCsvModalOpen = ref(false);
const editingUnitId = ref<string | null>(null);

// Property Filter State
const selectedPropertyFilter = ref('ALL');

// Form States
const form = ref({
  property_name: 'Property A',
  unit_number: '',
  rent_amount: '',
  tenant_name: '',
  tenant_phone: '',
  is_vacant: false,
});

const formErrors = ref({
  unit_number: '',
  rent_amount: '',
});

// Filter Tabs Config
const propertyFilterTabs = computed(() => {
  const tabs = [
    { label: 'All Properties', value: 'ALL', count: processedUnits.value.length }
  ];
  properties.value.forEach(prop => {
    const count = processedUnits.value.filter(u => u.property_name === prop).length;
    tabs.push({ label: prop, value: prop, count });
  });
  return tabs;
});

// Filtered Units List
const filteredUnits = computed(() => {
  if (selectedPropertyFilter.value === 'ALL') return processedUnits.value;
  return processedUnits.value.filter(u => u.property_name === selectedPropertyFilter.value);
});

// Open History Drawer / Modal
const openHistory = (unit: Unit) => {
  selectedUnitForHistory.value = unit;
  isHistoryModalOpen.value = true;
};

// Form Reset & Validation
const resetForm = () => {
  form.value = {
    property_name: properties.value[0] || 'Property A',
    unit_number: '',
    rent_amount: '',
    tenant_name: '',
    tenant_phone: '',
    is_vacant: false,
  };
  formErrors.value = { unit_number: '', rent_amount: '' };
};

const validateForm = () => {
  formErrors.value = { unit_number: '', rent_amount: '' };
  let valid = true;
  if (!form.value.unit_number.trim()) {
    formErrors.value.unit_number = 'Unit designation required';
    valid = false;
  }
  if (!form.value.rent_amount || Number(form.value.rent_amount) <= 0) {
    formErrors.value.rent_amount = 'Valid monthly rent required';
    valid = false;
  }
  return valid;
};

// Add Unit
const handleAddUnit = () => {
  if (!validateForm()) return;

  addUnit({
    property_name: form.value.property_name,
    unit_number: form.value.unit_number.trim(),
    rent_amount: Number(form.value.rent_amount),
    tenant_name: form.value.is_vacant ? '' : form.value.tenant_name.trim(),
    tenant_phone: form.value.is_vacant ? '' : form.value.tenant_phone.trim(),
    is_vacant: form.value.is_vacant,
  });

  addToast('Success', `Unit ${form.value.unit_number} added successfully`, 'success');
  isAddModalOpen.value = false;
  resetForm();
};

// Edit Unit Setup & Save
const openEditModal = (unit: Unit) => {
  editingUnitId.value = unit.id;
  form.value = {
    property_name: unit.property_name,
    unit_number: unit.unit_number,
    rent_amount: unit.rent_amount.toString(),
    tenant_name: unit.tenant_name || '',
    tenant_phone: unit.tenant_phone || '',
    is_vacant: unit.is_vacant,
  };
  isEditModalOpen.value = true;
};

const handleUpdateUnit = () => {
  if (!editingUnitId.value || !validateForm()) return;

  updateUnit(editingUnitId.value, {
    property_name: form.value.property_name,
    unit_number: form.value.unit_number.trim(),
    rent_amount: Number(form.value.rent_amount),
    tenant_name: form.value.is_vacant ? '' : form.value.tenant_name.trim(),
    tenant_phone: form.value.is_vacant ? '' : form.value.tenant_phone.trim(),
    is_vacant: form.value.is_vacant,
  });

  addToast('Success', `Unit ${form.value.unit_number} updated`, 'success');
  isEditModalOpen.value = false;
  editingUnitId.value = null;
  resetForm();
};

// Delete Unit
const handleDeleteUnit = (id: string, unitNum: string) => {
  if (confirm(`Are you sure you want to delete Unit ${unitNum}? This action cannot be undone.`)) {
    deleteUnit(id);
    addToast('Deleted', `Unit ${unitNum} removed`, 'info');
  }
};
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
      <div>
        <h2 class="text-base font-bold text-white tracking-tight">Units & Property Directory</h2>
        <p class="text-xs text-slate-400">Manage tenant profiles, monthly rent allocations, and transaction ledgers.</p>
      </div>
      
      <div class="flex gap-2">
        <ActionButton variant="outline" @click="isCsvModalOpen = true">
          Import CSV
        </ActionButton>
        <ActionButton variant="primary" @click="resetForm(); isAddModalOpen = true;">
          + Add New Unit
        </ActionButton>
      </div>
    </div>

    <!-- Filter Tabs Bar -->
    <div class="flex items-center justify-between gap-4">
      <FilterTabs v-model="selectedPropertyFilter" :tabs="propertyFilterTabs" />
    </div>

    <!-- Units Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <div 
        v-for="unit in filteredUnits" 
        :key="unit.id" 
        class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
      >
        <!-- Card Header -->
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              {{ unit.property_name }}
            </span>
            <h3 class="text-lg font-bold font-mono text-white">Unit {{ unit.unit_number }}</h3>
          </div>

          <StatusBadge :status="unit.status" />
        </div>

        <!-- Tenant Metadata -->
        <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500 font-semibold uppercase text-[10px]">Tenant</span>
            <span class="text-slate-200 font-bold">{{ unit.tenant_name || '— Vacant —' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-semibold uppercase text-[10px]">Phone</span>
            <span class="text-slate-400 font-mono">{{ unit.tenant_phone || 'N/A' }}</span>
          </div>
        </div>

        <!-- Ledger Financial Metrics -->
        <div class="space-y-2 bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold uppercase text-slate-500">Monthly Rent</span>
            <span class="font-bold font-mono text-slate-200">{{ formatKSh(unit.rent_amount) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold uppercase text-slate-500">Paid this Month</span>
            <span class="font-bold font-mono text-emerald-400">{{ formatKSh(unit.totalPaid) }}</span>
          </div>
          <div class="flex justify-between items-center pt-1.5 border-t border-slate-800/60">
            <span class="text-[10px] font-bold uppercase text-slate-500">Net Balance Due</span>
            <span class="font-bold font-mono" :class="unit.balanceDue > 0 ? 'text-rose-400' : 'text-slate-400'">
              {{ formatKSh(unit.balanceDue) }}
            </span>
          </div>
        </div>

        <!-- Card Actions Footbar -->
        <div class="flex items-center gap-2 pt-2 border-t border-slate-900">
          <ActionButton variant="outline" class="flex-1" @click="openHistory(unit)">
             History
          </ActionButton>

          <button 
            @click="openEditModal(unit)" 
            class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold transition"
          >
            Edit
          </button>

          <button 
            @click="handleDeleteUnit(unit.id, unit.unit_number)" 
            class="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-semibold transition"
          >
            🗑
          </button>
        </div>

      </div>

    </div>

    <!-- Tenant History Timeline & Receipt Modal -->
    <TenantHistoryModal 
      :isOpen="isHistoryModalOpen" 
      :unit="selectedUnitForHistory" 
      @close="isHistoryModalOpen = false" 
    />

    <!-- CSV Import Modal Component Binding -->
    <CsvImportModal :isOpen="isCsvModalOpen" @close="isCsvModalOpen = false" />

    <!-- Add / Edit Unit Modal -->
    <div v-if="isAddModalOpen || isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white tracking-tight">
            {{ isEditModalOpen ? 'Edit Unit Details' : 'Register New Property Unit' }}
          </h3>
          <button @click="isAddModalOpen = false; isEditModalOpen = false;" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Property Name</label>
            <input v-model="form.property_name" placeholder="e.g. Property A" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Unit Number / Code</label>
            <input v-model="form.unit_number" placeholder="e.g. A1, B12" class="w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm font-mono text-white outline-none" :class="formErrors.unit_number ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" />
            <span v-if="formErrors.unit_number" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ formErrors.unit_number }}</span>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly Rent (KSh)</label>
            <input v-model="form.rent_amount" type="number" placeholder="e.g. 25000" class="w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm font-mono text-white outline-none" :class="formErrors.rent_amount ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" />
            <span v-if="formErrors.rent_amount" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ formErrors.rent_amount }}</span>
          </div>

          <div class="flex items-center gap-2 py-1">
            <input id="vacant-check" v-model="form.is_vacant" type="checkbox" class="h-4 w-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0" />
            <label for="vacant-check" class="text-xs font-semibold text-slate-300">Mark unit as Vacant</label>
          </div>

          <div v-if="!form.is_vacant" class="space-y-3.5 pt-1 border-t border-slate-900">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Name</label>
              <input v-model="form.tenant_name" placeholder="e.g. Jane Doe" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Phone Number</label>
              <input v-model="form.tenant_phone" placeholder="e.g. +254712345678" class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="flex gap-3 pt-3">
            <ActionButton variant="outline" class="flex-1" @click="isAddModalOpen = false; isEditModalOpen = false;">
              Cancel
            </ActionButton>
            <ActionButton variant="primary" class="flex-1" @click="isEditModalOpen ? handleUpdateUnit() : handleAddUnit()">
              {{ isEditModalOpen ? 'Save Changes' : 'Create Unit' }}
            </ActionButton>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>