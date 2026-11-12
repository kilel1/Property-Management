<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  subtitle: string;
  valueColor?: string; // e.g. 'text-emerald-400', 'text-rose-400', 'text-blue-400', 'text-white'
}>();
</script>

<template>
  <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ title }}</p>
    <div class="my-2">
      <p class="text-lg sm:text-xl font-bold font-mono tracking-tight" :class="valueColor || 'text-white'">
        {{ value }}
      </p>
    </div>
    <p class="text-xs text-slate-500">{{ subtitle }}</p>
  </div>
</template>