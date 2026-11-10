<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="pointer-events-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
      >
        <!-- Status Indicator Icon/Dot -->
        <div 
          class="h-2 w-2 rounded-full mt-2 shrink-0" 
          :class="{
            'bg-emerald-400 shadow-lg shadow-emerald-500/50': toast.type === 'success',
            'bg-rose-400 shadow-lg shadow-rose-500/50': toast.type === 'error',
            'bg-blue-400 shadow-lg shadow-blue-500/50': toast.type === 'info',
          }"
        ></div>

        <!-- Toast Message Body -->
        <div class="flex-1 space-y-0.5">
          <h5 class="text-xs font-bold text-white tracking-wide">{{ toast.title }}</h5>
          <p class="text-[11px] text-slate-400 leading-snug">{{ toast.message }}</p>
        </div>

        <!-- Dismiss Button -->
        <button 
          @click="removeToast(toast.id)" 
          class="text-slate-500 hover:text-slate-300 text-xs font-bold transition p-1"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>