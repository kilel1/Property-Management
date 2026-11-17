<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const router = useRouter();
const { login, register } = useAuth();
const { addToast } = useToast();

const isSignUp = ref(false);

// Form states
const email = ref('');
const password = ref('');
const fullName = ref('');
const organization = ref('');
const role = ref<'owner' | 'manager'>('owner');

const showPassword = ref(false);
const error = ref('');

const handleSubmit = () => {
  error.value = '';

  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Email and password are required.';
    return;
  }

  if (isSignUp.value) {
    if (!fullName.value.trim() || !organization.value.trim()) {
      error.value = 'Full name and apartment/property name are required.';
      return;
    }

    const res = register({
      name: fullName.value,
      email: email.value,
      password: password.value,
      role: role.value,
      organization: organization.value,
    });

    if (res.ok) {
      addToast('Account Created', `Welcome to Rent Ledger, ${fullName.value}!`, 'success');
      router.push('/');
    } else {
      error.value = res.error || 'Registration failed.';
    }
  } else {
    const res = login(email.value, password.value);
    if (res.ok) {
      addToast('Welcome Back', 'Logged in successfully.', 'success');
      router.push('/');
    } else {
      error.value = res.error || 'Invalid email or password.';
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
      
      <!-- Brand Header -->
      <div class="text-center space-y-2">
        <div class="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-lg shadow-blue-600/30">
          BL
        </div>
        <h1 class="text-xl font-bold text-white tracking-tight">Rent Ledger SaaS</h1>
        <p class="text-xs text-slate-400">Multi-tenant apartment & rental management engine</p>
      </div>

      <!-- Tab Switcher (Sign In vs Sign Up) -->
      <div class="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
        <button
          type="button"
          @click="isSignUp = false; error = ''"
          :class="[
            'py-2 text-xs font-bold rounded-lg transition',
            !isSignUp ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          ]"
        >
          Sign In
        </button>
        <button
          type="button"
          @click="isSignUp = true; error = ''"
          :class="[
            'py-2 text-xs font-bold rounded-lg transition',
            isSignUp ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          ]"
        >
          Create Account
        </button>
      </div>

      <!-- Auth Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Full Name (Sign Up Only) -->
        <div v-if="isSignUp">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
          <input 
            v-model="fullName" 
            type="text" 
            placeholder="e.g. David Mwangi"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="name@domain.co.ke"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
          <div class="relative">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••"
              class="w-full px-4 py-3 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition focus:outline-none"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <!-- Eye Open -->
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <!-- Eye Off -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Role Selector (Sign Up Only) -->
        <template v-if="isSignUp">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Account Role</label>
            <select 
              v-model="role" 
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
            >
              <option value="owner">Property Owner / Landlord</option>
              <option value="manager">Property Manager / Caretaker</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {{ role === 'owner' ? 'Apartment / Property Name' : 'Apartment Name to Join' }}
            </label>
            <input 
              v-model="organization" 
              type="text" 
              :placeholder="role === 'owner' ? 'e.g. Greenview Apartments' : 'e.g. Greenview Apartments'"
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition"
            />
          </div>
        </template>

        <span v-if="error" class="text-xs text-rose-400 font-semibold block text-center pt-1">{{ error }}</span>

        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition mt-2"
        >
          {{ isSignUp ? 'Complete Registration' : 'Sign In' }}
        </button>
      </form>

    </div>
  </div>
</template>