<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';

const { units, properties, addUnit, updateUnit, deleteUnit } = useRentLedger();
const { addToast } = useToast();

const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const propertyName = ref('');
const unitNum = ref('');
const rentAmt = ref('');
const tenantName = ref('');
const tenantPhone = ref('');
const selectedPropertyFilter = ref('ALL');

// Validation errors state
const errors = ref({
  propertyName: '',
  unitNum: '',
  rentAmt: '',
});

const openAdd = () => { 
  editingId.value = null; 
  propertyName.value = properties.value[0] || 'Property A'; 
  unitNum.value = ''; 
  rentAmt.value = ''; 
  tenantName.value = ''; 
  tenantPhone.value = ''; 
  errors.value = { propertyName: '', unitNum: '', rentAmt: '' };
  isModalOpen.value = true; 
};

const openEdit = (u: any) => { 
  editingId.value = u.id; 
  propertyName.value = u.property_name || 'Property A';
  unitNum.value = u.unit_number; 
  rentAmt.value = u.rent_amount; 
  tenantName.value = u.tenant_name; 
  tenantPhone.value = u.tenant_phone; 
  errors.value = { propertyName: '', unitNum: '', rentAmt: '' };
  isModalOpen.value = true; 
};

const save = () => {
  // Clear previous errors
  errors.value = { propertyName: '', unitNum: '', rentAmt: '' };
  
  let isValid = true;
  if (!propertyName.value.trim()) {
    errors.value.propertyName = 'Property name required';
    isValid = false;
  }
  if (!unitNum.value.trim()) {
    errors.value.unitNum = 'Unit number required';
    isValid = false;
  }
  if (!rentAmt.value) {
    errors.value.rentAmt = 'Rent amount required';
    isValid = false;
  }

  if (!isValid) return;

  const data = { 
    property_name: propertyName.value,
    unit_number: unitNum.value, 
    rent_amount: parseFloat(rentAmt.value), 
    tenant_name: tenantName.value, 
    tenant_phone: tenantPhone.value, 
    is_vacant: !tenantName.value 
  };

  if (editingId.value) {
    updateUnit(editingId.value, data);
    addToast('Success', 'Unit updated successfully', 'success');
  } else {
    addUnit(data);
    addToast('Success', 'Unit added successfully', 'success');
  }

  isModalOpen.value = false;
};

const handleDelete = (id: string) => {
  deleteUnit(id);
  addToast('Success', 'Unit deleted successfully', 'success');
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Units Directory</h2>
        <p class="text-xs text-slate-400 mt-0.5">Manage property buildings, units, and tenant assignments.</p>
      </div>
      <button @click="openAdd" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition">
        + Add Unit
      </button>
    </div>

    <!-- Property Filter Dropdown -->
    <div class="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Filter Property:</label>
      <select 
        v-model="selectedPropertyFilter" 
        class="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-blue-400 outline-none cursor-pointer focus:border-blue-500 transition max-w-xs w-full"
      >
        <option value="ALL">All Properties</option>
        <option v-for="prop in properties" :key="prop" :value="prop">{{ prop }}</option>
      </select>
    </div>

    <!-- Units Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="unit in units.filter(u => selectedPropertyFilter === 'ALL' || u.property_name === selectedPropertyFilter)" 
        :key="unit.id" 
        class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl"
      >
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
            {{ unit.property_name || 'Property A' }}
          </span>
          <span class="text-xs px-2.5 py-0.5 rounded-lg font-bold uppercase border shadow-sm" :class="unit.is_vacant ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'">
            {{ unit.is_vacant ? 'Vacant' : 'Occupied' }}
          </span>
        </div>

        <div>
          <h3 class="text-base font-bold font-mono text-white">Unit {{ unit.unit_number }}</h3>
          <p class="text-sm font-medium text-slate-200 mt-1">{{ unit.tenant_name || 'No tenant assigned' }}</p>
          <p class="text-xs text-slate-400 font-mono mt-0.5">{{ unit.tenant_phone || 'No phone recorded' }}</p>
        </div>

        <p class="text-xs font-semibold text-slate-300">Rent: <span class="text-sm font-bold text-white">{{ formatKSh(unit.rent_amount) }}</span></p>

        <div class="flex gap-2 pt-3 border-t border-slate-800/80">
          <button @click="openEdit(unit)" class="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-1.5 rounded-xl text-xs font-semibold transition">Edit</button>
          <button @click="handleDelete(unit.id)" class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 class="text-base font-bold text-white">{{ editingId ? 'Edit Property Unit' : 'Register New Unit' }}</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Property Name</label>
            <input v-model="propertyName" placeholder="e.g. Property A" class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition" :class="errors.propertyName ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" />
            <span v-if="errors.propertyName" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ errors.propertyName }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Unit Number</label>
              <input v-model="unitNum" placeholder="e.g. A1" class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition" :class="errors.unitNum ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" />
              <span v-if="errors.unitNum" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ errors.unitNum }}</span>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rent (KSh)</label>
              <input v-model="rentAmt" type="number" placeholder="25000" class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition" :class="errors.rentAmt ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" />
              <span v-if="errors.rentAmt" class="text-[10px] text-rose-400 font-semibold mt-1 block">{{ errors.rentAmt }}</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tenant Name</label>
            <input v-model="tenantName" placeholder="Leave blank if vacant" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mobile Contact</label>
            <input v-model="tenantPhone" placeholder="+254712345678" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button @click="save" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition">Save Unit</button>
          <button @click="isModalOpen = false" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition">Cancel</button>
        </div>

      </div>
    </div>
  </div>
</template>