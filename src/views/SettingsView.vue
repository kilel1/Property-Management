<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from '../composables/useToast';
import { useAuth } from '../composables/useAuth';

const { addToast } = useToast();
const { currentUser, isAdmin, isOwner, isManager } = useAuth();

// Both Admin and Owner can manage organization profiles, team, and billing
const canManageOrg = computed(() => isAdmin.value || isOwner.value);

const SETTINGS_KEY = 'rent_ledger_settings_v1';
const UNITS_KEY = 'rent_ledger_units_v4';
const EXPENSES_KEY = 'rent_ledger_expenses_v4';
const TEAM_KEY = 'rent_ledger_team_v1';

// Active settings tab
const activeTab = ref<'general' | 'preferences' | 'team' | 'billing' | 'data'>('general');

// Auto-fallback to 'general' if switching roles while viewing a restricted tab
watch(
  () => currentUser.value?.role,
  (newRole) => {
    if (newRole === 'manager' && (activeTab.value === 'team' || activeTab.value === 'billing')) {
      activeTab.value = 'general';
    }
  }
);

// Form states
const orgName = ref('Prime Realty Agency');
const supportEmail = ref('admin@primerealty.co.ke');
const defaultCurrency = ref('KSh');
const mpesaPaybill = ref('123456');
const autoBackup = ref(true);

// Team management state
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Caretaker';
}

const teamMembers = ref<TeamMember[]>([
  { id: '1', name: 'David Mwangi', email: 'owner@primerealty.co.ke', role: 'Owner' },
  { id: '2', name: 'John Kamau', email: 'caretaker@primerealty.co.ke', role: 'Manager' }
]);

const newMemberName = ref('');
const newMemberEmail = ref('');
const newMemberRole = ref<'Owner' | 'Manager' | 'Caretaker'>('Manager');

// File input ref for restore
const fileInputRef = ref<HTMLInputElement | null>(null);

// Load saved settings & team on mount
onMounted(() => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      orgName.value = parsed.orgName ?? orgName.value;
      supportEmail.value = parsed.supportEmail ?? supportEmail.value;
      defaultCurrency.value = parsed.defaultCurrency ?? defaultCurrency.value;
      mpesaPaybill.value = parsed.mpesaPaybill ?? mpesaPaybill.value;
      autoBackup.value = parsed.autoBackup ?? autoBackup.value;
    } catch {}
  }

  const savedTeam = localStorage.getItem(TEAM_KEY);
  if (savedTeam) {
    try {
      teamMembers.value = JSON.parse(savedTeam);
    } catch {}
  }
});

// Save settings to localStorage
const handleSave = () => {
  const payload = {
    orgName: orgName.value,
    supportEmail: supportEmail.value,
    defaultCurrency: defaultCurrency.value,
    mpesaPaybill: mpesaPaybill.value,
    autoBackup: autoBackup.value,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  addToast('Settings Saved', 'Your organization preferences have been updated.', 'success');
};

// Add team member
const handleAddMember = () => {
  if (!newMemberName.value.trim() || !newMemberEmail.value.trim()) {
    addToast('Error', 'Name and email are required.', 'error');
    return;
  }
  teamMembers.value.push({
    id: Date.now().toString(),
    name: newMemberName.value,
    email: newMemberEmail.value,
    role: newMemberRole.value,
  });
  localStorage.setItem(TEAM_KEY, JSON.stringify(teamMembers.value));
  newMemberName.value = '';
  newMemberEmail.value = '';
  addToast('Member Added', 'New team member invited successfully.', 'success');
};

const handleRemoveMember = (id: string) => {
  teamMembers.value = teamMembers.value.filter(m => m.id !== id);
  localStorage.setItem(TEAM_KEY, JSON.stringify(teamMembers.value));
  addToast('Member Removed', 'Access revoked successfully.', 'info');
};

// Export JSON backup
const handleExportBackup = () => {
  const backupData = {
    exportedAt: new Date().toISOString(),
    settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    units: JSON.parse(localStorage.getItem(UNITS_KEY) || '[]'),
    expenses: JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]'),
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rent-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  addToast('Backup Exported', 'Your ledger data has been downloaded as JSON.', 'success');
};

// Restore backup
const triggerRestore = () => {
  fileInputRef.value?.click();
};

const handleFileRestore = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string);
      if (parsed.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
      if (parsed.units) localStorage.setItem(UNITS_KEY, JSON.stringify(parsed.units));
      if (parsed.expenses) localStorage.setItem(EXPENSES_KEY, JSON.stringify(parsed.expenses));

      addToast('Backup Restored', 'Ledger data successfully restored.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      addToast('Restore Failed', 'Invalid backup file.', 'error');
    }
  };
  reader.readAsText(file);
  target.value = '';
};

// Clear cache
const handleClearCache = () => {
  if (confirm('Are you sure? This will erase all local units and expenses.')) {
    localStorage.removeItem(UNITS_KEY);
    localStorage.removeItem(EXPENSES_KEY);
    addToast('Cache Cleared', 'Local storage has been reset.', 'success');
    window.location.reload();
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 font-sans text-slate-100 pb-12">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">
          {{ isManager ? 'Workspace Preferences' : 'System Settings' }}
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          {{ isManager 
            ? 'View organization details and payment reference defaults.' 
            : 'Manage organization profiles, team access permissions, and data backups.' 
          }}
        </p>
      </div>
      <span class="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-400 w-fit">
        Viewing as: {{ currentUser?.role || 'admin' }}
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      <!-- Left Navigation Tabs -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1 h-fit">
        <button 
          type="button" 
          @click="activeTab = 'general'"
          :class="['w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition', activeTab === 'general' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
        >
          Organization Profile
        </button>
        <button 
          type="button" 
          @click="activeTab = 'preferences'"
          :class="['w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition', activeTab === 'preferences' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
        >
          Regional & M-Pesa
        </button>
        <button 
          v-if="canManageOrg"
          type="button" 
          @click="activeTab = 'team'"
          :class="['w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition', activeTab === 'team' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
        >
          Team & Roles
        </button>
        <button 
          v-if="canManageOrg"
          type="button" 
          @click="activeTab = 'billing'"
          :class="['w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition', activeTab === 'billing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
        >
          SaaS Subscription
        </button>
        <button 
          v-if="canManageOrg"
          type="button" 
          @click="activeTab = 'data'"
          :class="['w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition', activeTab === 'data' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
        >
          Data & Storage
        </button>
      </div>

      <!-- Right Content Pane -->
      <div class="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        
        <!-- Tab 1: Organization Profile -->
        <div v-if="activeTab === 'general'" class="space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Organization Profile</h2>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-400">Company / Agency Name</label>
            <input 
              v-model="orgName" 
              :disabled="!canManageOrg"
              type="text" 
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-400">Billing / Support Email</label>
            <input 
              v-model="supportEmail" 
              :disabled="!canManageOrg"
              type="email" 
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed" 
            />
          </div>
        </div>

        <!-- Tab 2: Regional & M-Pesa Preferences -->
        <div v-if="activeTab === 'preferences'" class="space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Regional & Payment Defaults</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-400">Default Currency</label>
              <select 
                v-model="defaultCurrency" 
                :disabled="!canManageOrg"
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="KSh">KSh (Kenyan Shilling)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-400">Default M-Pesa Paybill / Till</label>
              <input 
                v-model="mpesaPaybill" 
                :disabled="!canManageOrg"
                type="text" 
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        <!-- Tab 3: Team & Roles (Admin & Owner) -->
        <div v-if="activeTab === 'team' && canManageOrg" class="space-y-6">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Property Owners & Managers</h2>
          
          <!-- Add Member Form -->
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Invite Team Member</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input v-model="newMemberName" type="text" placeholder="Full Name" class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500" />
              <input v-model="newMemberEmail" type="email" placeholder="Email Address" class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500" />
              <select v-model="newMemberRole" class="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500">
                <option v-if="isAdmin" value="Owner">Property Owner</option>
                <option value="Manager">Property Manager</option>
                <option value="Caretaker">Caretaker</option>
              </select>
            </div>
            <button type="button" @click="handleAddMember" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition">
              Send Invite
            </button>
          </div>

          <!-- Team List -->
          <div class="space-y-2">
            <div v-for="member in teamMembers" :key="member.id" class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p class="text-xs font-bold text-white">
                  {{ member.name }} 
                  <span class="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded">{{ member.role }}</span>
                </p>
                <p class="text-[11px] text-slate-400">{{ member.email }}</p>
              </div>
              <button 
                v-if="isAdmin || member.role !== 'Owner'"
                type="button" 
                @click="handleRemoveMember(member.id)" 
                class="text-xs text-rose-400 hover:text-rose-300"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 4: SaaS Subscription (Admin & Owner) -->
        <div v-if="activeTab === 'billing' && canManageOrg" class="space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Subscription & Tier</h2>
          <div class="p-4 bg-slate-950 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-bold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg">Professional Tier</span>
              <p class="text-sm font-semibold text-white mt-2">Up to 100 Units Managed</p>
              <p class="text-xs text-slate-400">Renews on December 1, 2026 • KSh 5,000/mo</p>
            </div>
            <button type="button" @click="addToast('Billing Portal', 'Subscription management will connect once backend billing is live.', 'info')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition w-fit">
              {{ isAdmin ? 'Configure Tiers' : 'Manage Plan' }}
            </button>
          </div>
        </div>

        <!-- Tab 5: Data & Storage (Admin & Owner) -->
        <div v-if="activeTab === 'data' && canManageOrg" class="space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Local Storage & Backups</h2>
          
          <div class="flex items-center justify-between py-2">
            <div>
              <p class="text-sm font-medium text-white">Automatic Browser Backups</p>
              <p class="text-xs text-slate-400">Keep local snapshots updated before backend sync.</p>
            </div>
            <input type="checkbox" v-model="autoBackup" class="h-4 w-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
          </div>

          <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileRestore" />

          <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
            <button type="button" @click="handleExportBackup" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition">
              Export JSON Backup
            </button>
            <button v-if="isAdmin" type="button" @click="triggerRestore" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition">
              Restore Backup
            </button>
            <button v-if="isAdmin" type="button" @click="handleClearCache" class="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition">
              Clear Local Cache
            </button>
          </div>
        </div>

        <!-- Global Save Action (Admin & Owner only) -->
        <div v-if="canManageOrg" class="pt-6 border-t border-slate-800 flex justify-end">
          <button type="button" @click="handleSave" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition">
            Save Changes
          </button>
        </div>

      </div>

    </div>

  </div>
</template>