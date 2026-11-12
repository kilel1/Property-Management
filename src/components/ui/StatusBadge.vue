<script setup lang="ts">
defineProps<{
  status: 'PAID' | 'DUE' | 'PARTIAL' | 'VACANT' | string;
}>();
</script>

<template>
  <span 
    class="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border"
    :class="{
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': status === 'PAID',
      'bg-rose-500/10 text-rose-400 border-rose-500/20': status === 'DUE' || status === 'PARTIAL',
      'bg-amber-500/10 text-amber-400 border-amber-500/20': status === 'VACANT',
      'bg-blue-500/10 text-blue-400 border-blue-500/20': status !== 'PAID' && status !== 'DUE' && status !== 'PARTIAL' && status !== 'VACANT'
    }"
  >
    {{ status }}
  </span>
</template>