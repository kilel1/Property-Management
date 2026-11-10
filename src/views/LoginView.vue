<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const router = useRouter();
const { login } = useAuth();
const { addToast } = useToast();

const email = ref('brian.kibet@rentledger.local');
const password = ref('••••••••');
const error = ref('');

const handleLogin = () => {
  error.value = '';
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Email and password required';
    return;
  }

  const success = login(email.value, password.value);
  if (success) {
    addToast('Welcome Back', 'Logged in successfully.', 'success');
    router.push('/');
  } else {
    error.value = 'Invalid credentials';
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
      
      <div class="text-center space-y-2">
        <div class="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-lg shadow-blue-600/30">
          RL
        </div>
        <h1 class="text-xl font-bold text-white tracking-tight">Rent Ledger SaaS</h1>
        <p class="text-xs text-slate-400">Sign in to your property management workspace</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>

        <span v-if="error" class="text-xs text-rose-400 font-semibold block text-center">{{ error }}</span>

        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition mt-2"
        >
          Sign In
        </button>
      </form>

    </div>
  </div>
</template>