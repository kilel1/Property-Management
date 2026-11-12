<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'danger' | 'outline' | 'success';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}>();

defineEmits(['click']);
</script>

<template>
  <button 
    :type="type || 'button'"
    @click="$emit('click')"
    class="px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm outline-none"
    :class="[
      fullWidth ? 'w-full' : '',
      variant === 'primary' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 shadow-lg' : '',
      variant === 'danger' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' : '',
      variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 shadow-lg' : '',
      (!variant || variant === 'outline') ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700' : ''
    ]"
  >
    <slot />
  </button>
</template>