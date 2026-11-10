<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  unitToEdit?: any | null;
}>();

const emit = defineEmits(['close', 'save']);

const propertyName = ref('');
const unitNumber = ref('');
const rentAmount = ref('');
const tenantName = ref('');
const tenantPhone = ref('');

watch(() => props.unitToEdit, (val) => {
  if (val) {
    propertyName.value = val.property_name || '';
    unitNumber.value = val.unit_number || '';
    rentAmount.value = val.rent_amount || '';
    tenantName.value = val.tenant_name || '';
    tenantPhone.value = val.tenant_phone || '';
  } else {
    propertyName.value = 'Property A';
    unitNumber.value = '';
    rentAmount.value = '';
    tenantName.value = '';
    tenantPhone.value = '';
  }
}, { immediate: true });

const handleSave = () => {
  if (!propertyName.value || !unitNumber.value || !rentAmount.value) return;
  emit('save', {
    property_name: propertyName.value,
    unit_number: unitNumber.value,
    rent_amount: parseFloat(rentAmount.value),
    tenant_name: tenantName.value,
    tenant_phone: tenantPhone.value,
    is_vacant: !tenantName.value,
  });
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
      
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight">{{ unitToEdit ? 'Edit Property Unit' : 'Register New Property Unit' }}</h3>
          <p class="text-xs text-slate-400 mt-0.5">Fill in the details below to add a unit to your portfolio catalog.</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
          ✕
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Property Name / Building</label>
          <input 
            v-model="propertyName" 
            type="text" 
            required 
            placeholder="e.g. Property A, Sunset Heights" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition" 
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Number</label>
            <input 
              v-model="unitNumber" 
              type="text" 
              required 
              placeholder="e.g. A1, B14" 
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Monthly Rent (KSh)</label>
            <input 
              v-model="rentAmount" 
              type="number" 
              required 
              placeholder="25000" 
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition" 
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tenant Name</label>
          <input 
            v-model="tenantName" 
            type="text" 
            placeholder="Leave blank if vacant" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tenant Mobile Contact</label>
          <input 
            v-model="tenantPhone" 
            type="text" 
            placeholder="+254712345678" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition" 
          />
        </div>

        <!-- Action Footer -->
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button 
            type="button" 
            @click="emit('close')" 
            class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
          >
            Save Unit
          </button>
        </div>

      </form>
    </div>
  </div>
</template>