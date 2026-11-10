<script setup lang="ts">
import { ref, watch } from 'vue';
import { useProfile } from '../composables/useProfile';
import { useToast } from '../composables/useToast';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);

const { profile, updateProfile } = useProfile();
const { addToast } = useToast();

const name = ref('');
const role = ref('');
const email = ref('');
const error = ref('');

watch(() => props.isOpen, (val) => {
  if (val) {
    name.value = profile.value.name;
    role.value = profile.value.role;
    email.value = profile.value.email || '';
    error.value = '';
  }
});

const handleSave = () => {
  if (!name.value.trim()) {
    error.value = 'Name required';
    return;
  }
  if (!role.value.trim()) {
    error.value = 'Role required';
    return;
  }
  if (!email.value.trim()) {
    error.value = 'Email required';
    return;
  }

  updateProfile({
    name: name.value.trim(),
    role: role.value.trim(),
    email: email.value.trim(),
    initials: profile.value.initials,
  });

  addToast('Success', 'Profile updated successfully', 'success');
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white">Edit Administrator Profile</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white font-bold">✕</button>
      </div>

      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
          <input 
            v-model="name" 
            placeholder="Brian Kibet" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition"
            :class="error && !name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
          <input 
            v-model="email" 
            type="email"
            placeholder="brian@example.com" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition"
            :class="error && !email ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Role / Title</label>
          <input 
            v-model="role" 
            placeholder="Administrator" 
            class="w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white outline-none transition"
            :class="error && !role ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'" 
          />
        </div>
        <span v-if="error" class="text-[10px] text-rose-400 font-semibold block">{{ error }}</span>
      </div>

      <div class="flex gap-3 pt-2">
        <button @click="handleSave" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition">Save Profile</button>
        <button @click="emit('close')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition">Cancel</button>
      </div>
    </div>
  </div>
</template>