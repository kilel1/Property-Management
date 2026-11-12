<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRentLedger, formatKSh } from '../composables/useRentLedger';
import StatusBadge from './ui/StatusBadge.vue';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  placeholder?: string;
}>(), {
  placeholder: 'Type unit number, tenant name, or M-Pesa ref (e.g. A1, Kibet, QHX...)'
});

const emit = defineEmits(['close']);

const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const { processedUnits } = useRentLedger();

// Auto-focus input when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.value = '';
    setTimeout(() => searchInputRef.value?.focus(), 50);
  }
});

// Global Keyboard Listener for Cmd+K / Ctrl+K
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (props.isOpen) {
      emit('close');
    } else {
      searchQuery.value = '';
    }
  } else if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Filtered Results across units, tenants, and payment references
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const query = searchQuery.value.toLowerCase().trim();

  const results: Array<{
    type: string;
    title: string;
    subtitle: string;
    badge?: string;
    detail: string;
  }> = [];

  processedUnits.value.forEach(unit => {
    // Match Unit Number or Property Name
    if (unit.unit_number.toLowerCase().includes(query) || unit.property_name.toLowerCase().includes(query)) {
      results.push({
        type: 'Unit',
        title: `${unit.property_name} - Unit ${unit.unit_number}`,
        subtitle: unit.tenant_name ? `Tenant: ${unit.tenant_name}` : 'Vacant Unit',
        badge: unit.status,
        detail: `Rent: ${formatKSh(unit.rent_amount)}`,
      });
    }

    // Match Tenant Name or Phone
    if (unit.tenant_name?.toLowerCase().includes(query) || unit.tenant_phone?.includes(query)) {
      results.push({
        type: 'Tenant',
        title: unit.tenant_name || 'Tenant',
        subtitle: `${unit.property_name} (Unit ${unit.unit_number}) | ${unit.tenant_phone || 'No Phone'}`,
        badge: unit.status,
        detail: `Balance: ${formatKSh(unit.balanceDue)}`,
      });
    }

    // Match Payment Reference Code
    if (unit.payments) {
      unit.payments.forEach(payment => {
        if (payment.reference.toLowerCase().includes(query) || payment.receipt_number.toLowerCase().includes(query)) {
          results.push({
            type: 'Payment',
            title: `Ref: ${payment.reference} (${payment.receipt_number})`,
            subtitle: `${unit.property_name} - Unit ${unit.unit_number} (${unit.tenant_name || 'N/A'})`,
            detail: `Amount: ${formatKSh(payment.amount)}`,
          });
        }
      });
    }
  });

  return results;
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
      
      <!-- Search Input Bar -->
      <div class="p-4 border-b border-slate-800 flex items-center gap-3">
        <span class="text-slate-400 text-lg">🔍</span>
        <input 
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button @click="emit('close')" class="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:text-white">ESC</button>
      </div>

      <!-- Search Results List -->
      <div class="max-h-96 overflow-y-auto p-3 space-y-2">
        <div v-if="searchQuery && searchResults.length === 0" class="py-8 text-center text-xs text-slate-500">
          No matching units, tenants, or transaction references found.
        </div>

        <div v-if="!searchQuery" class="py-8 text-center text-xs text-slate-500">
          Start typing to search across all properties, tenants, and payment receipts...
        </div>

        <div 
          v-for="(res, idx) in searchResults" 
          :key="idx"
          class="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between transition cursor-pointer"
          @click="emit('close')"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {{ res.type }}
              </span>
              <span class="text-xs font-bold text-white">{{ res.title }}</span>
              <StatusBadge v-if="res.badge" :status="res.badge" />
            </div>
            <p class="text-xs text-slate-400">{{ res.subtitle }}</p>
          </div>
          <div class="text-xs font-mono font-semibold text-emerald-400">
            {{ res.detail }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-slate-900/40 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>Quick Navigation</span>
        <span class="font-mono text-slate-400">Press <kbd class="bg-slate-800 px-1.5 py-0.5 rounded text-white">Cmd</kbd> + <kbd class="bg-slate-800 px-1.5 py-0.5 rounded text-white">K</kbd> anywhere</span>
      </div>

    </div>
  </div>
</template>