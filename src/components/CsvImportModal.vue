<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import ActionButton from './ui/ActionButton.vue';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  expectedHeaders?: string;
  exampleRow?: string;
}>(), {
  expectedHeaders: 'property_name, unit_number, rent_amount, tenant_name, tenant_phone',
  exampleRow: 'Heights Plaza, A101, 35000, John Mwangi, +254712345678'
});

const emit = defineEmits(['close']);
const { addUnitsBatch } = useRentLedger();

const parsedUnits = ref<Array<{ property_name: string; unit_number: string; rent_amount: number; tenant_name: string; tenant_phone: string; is_vacant: boolean }>>([]);
const fileName = ref('');
const errorMessage = ref('');

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  fileName.value = file.name;
  errorMessage.value = '';
  parsedUnits.value = [];

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length < 2) {
        errorMessage.value = 'CSV file must include a header row and at least one data row.';
        return;
      }

      const dataRows = lines.slice(1);
      const tempUnits: typeof parsedUnits.value = [];

      dataRows.forEach((row) => {
        const columns = row.split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
        if (columns.length >= 3) {
          const property_name = columns[0] || 'Default Property';
          const unit_number = columns[1] || 'U-0';
          const rent_amount = Number(columns[2]) || 0;
          const tenant_name = columns[3] || '';
          const tenant_phone = columns[4] || '';

          tempUnits.push({
            property_name,
            unit_number,
            rent_amount,
            tenant_name,
            tenant_phone,
            is_vacant: !tenant_name,
          });
        }
      });

      if (tempUnits.length === 0) {
        errorMessage.value = 'Could not parse any valid unit records from the CSV file.';
      } else {
        parsedUnits.value = tempUnits;
      }
    } catch (err) {
      errorMessage.value = 'Failed to process CSV file. Ensure it is formatted properly.';
    }
  };

  reader.readAsText(file);
};

const handleConfirmImport = () => {
  if (parsedUnits.value.length === 0) return;
  addUnitsBatch(parsedUnits.value);
  parsedUnits.value = [];
  fileName.value = '';
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
      
      <div class="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold font-mono text-white">Bulk Unit CSV Import</h3>
          <p class="text-xs text-slate-400">Upload a CSV file to seed multiple units at once.</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      <!-- Instructions using props -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
        <p class="font-bold text-white">CSV Column Requirements (with header row):</p>
        <code class="block bg-slate-950 p-2 rounded border border-slate-800 font-mono text-blue-400">
          {{ expectedHeaders }}
        </code>
        <p class="text-slate-400 text-[11px]">Example row: <span class="font-mono text-slate-200">{{ exampleRow }}</span></p>
      </div>

      <!-- File Drop & Preview Section -->
      <div class="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center space-y-3 bg-slate-900/20">
        <div class="text-3xl">📄</div>
        <div class="space-y-1">
          <p class="text-xs text-slate-300 font-semibold">{{ fileName || 'Select or drag your .csv file here' }}</p>
          <p class="text-[10px] text-slate-500">Comma-separated values (.csv format)</p>
        </div>
        <label class="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition">
          Browse CSV File
          <input type="file" accept=".csv" @change="handleFileUpload" class="hidden" />
        </label>
      </div>

      <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-400">
        {{ errorMessage }}
      </div>

      <div v-if="parsedUnits.length > 0" class="space-y-3">
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-white">Preview Units to Import ({{ parsedUnits.length }})</span>
          <span class="text-emerald-400 font-mono font-semibold">Ready to import</span>
        </div>

        <div class="max-h-48 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800">
          <div 
            v-for="(u, idx) in parsedUnits" 
            :key="idx"
            class="p-2.5 bg-slate-900/40 flex items-center justify-between text-xs"
          >
            <div class="font-mono">
              <span class="text-blue-400 font-bold">{{ u.property_name }}</span> — 
              <span class="text-white">Unit {{ u.unit_number }}</span>
            </div>
            <div class="text-right">
              <span class="font-mono font-bold text-slate-200">{{ formatKSh(u.rent_amount) }}</span>
              <span class="text-[10px] text-slate-400 ml-2">({{ u.tenant_name || 'Vacant' }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-800 flex justify-end gap-2">
        <ActionButton variant="outline" @click="emit('close')">Cancel</ActionButton>
        <ActionButton 
          variant="primary" 
          :disabled="parsedUnits.length === 0" 
          @click="handleConfirmImport"
        >
          Import {{ parsedUnits.length }} Units
        </ActionButton>
      </div>

    </div>
  </div>
</template>