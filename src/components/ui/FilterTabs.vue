<script setup lang="ts">
defineProps<{
  modelValue: string;
  tabs: { label: string; value: string; count?: number; activeColor?: string }[];
}>();

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
    <button 
      v-for="tab in tabs" 
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)" 
      class="px-3 py-1 rounded-lg text-xs font-bold transition"
      :class="modelValue === tab.value ? (tab.activeColor || 'bg-blue-600 text-white shadow-md') : 'text-slate-400 hover:text-white'"
    >
      {{ tab.label }} <span v-if="tab.count !== undefined">({{ tab.count }})</span>
    </button>
  </div>
</template>