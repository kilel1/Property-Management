<script setup lang="ts">
import { ref } from 'vue';
import { useRentLedger } from '../composables/useRentLedger';
import { useToast } from '../composables/useToast';
import ActionButton from '../components/ui/ActionButton.vue';

const { units, expenses, auditLogs } = useRentLedger();
const { addToast } = useToast();

const fileInputRef = ref<HTMLInputElement | null>(null);

// Export Full JSON Backup
const exportBackup = () => {
  const backupData = {
    version: '4.0',
    exportDate: new Date().toISOString(),
    units: units.value,
    expenses: expenses.value,
    auditLogs: auditLogs.value,
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `rent_ledger_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  addToast('Success', 'System backup exported successfully', 'success');
};

// Trigger File Upload Dialog
const triggerImport = () => {
  fileInputRef.value?.click();
};

// Import & Restore JSON Backup
const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsedData = JSON.parse(content);

      if (!parsedData.units || !parsedData.expenses) {
        throw new Error('Invalid backup file structure.');
      }

      if (confirm('Restoring this backup will overwrite current local data. Are you sure?')) {
        units.value = parsedData.units;
        expenses.value = parsedData.expenses;
        if (parsedData.auditLogs) auditLogs.value = parsedData.auditLogs;

        localStorage.setItem('rent_ledger_units_v4', JSON.stringify(units.value));
        localStorage.setItem('rent_ledger_expenses_v4', JSON.stringify(expenses.value));

        addToast('Restored', 'Ledger data restored successfully from backup', 'success');
      }
    } catch (err) {
      addToast('Error', 'Failed to parse backup file. Ensure it is a valid JSON export.', 'error');
    } finally {
      target.value = ''; // Reset input
    }
  };

  reader.readAsText(file);
};

// Factory Reset / Clear Data
const handleClearData = () => {
  if (confirm('DANGER: This will wipe all units, payments, and expenses from local storage. This action cannot be undone!')) {
    localStorage.clear();
    units.value = [];
    expenses.value = [];
    auditLogs.value = [];
    addToast('Reset', 'All local data wiped. Refreshing application...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    
    <!-- Header -->
    <div class="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
      <h2 class="text-base font-bold text-white tracking-tight">Data Portability & System Backups</h2>
      <p class="text-xs text-slate-400">Export your local-first JSON snapshots, restore from previous backups, or manage browser storage before your Django backend migration.</p>
    </div>

    <!-- Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      <!-- Export Box -->
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div class="space-y-2">
          <div class="text-2xl"></div>
          <h3 class="text-sm font-bold text-white">Export Backup</h3>
          <p class="text-xs text-slate-400">Download your entire database (units, tenant history, expenses, audit logs) as a secure JSON file.</p>
        </div>
        <ActionButton variant="primary" fullWidth @click="exportBackup">
          Download JSON
        </ActionButton>
      </div>

      <!-- Import Box -->
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div class="space-y-2">
          <div class="text-2xl"></div>
          <h3 class="text-sm font-bold text-white">Restore Backup</h3>
          <p class="text-xs text-slate-400">Upload a previously exported JSON backup file to instantly restore your property ledger state.</p>
        </div>
        <input 
          type="file" 
          ref="fileInputRef" 
          @change="handleFileImport" 
          accept=".json" 
          class="hidden" 
        />
        <ActionButton variant="outline" fullWidth @click="triggerImport">
          Upload & Restore
        </ActionButton>
      </div>

      <!-- Danger Zone / Factory Reset -->
      <div class="bg-slate-950/80 border border-rose-900/40 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div class="space-y-2">
          <div class="text-2xl"></div>
          <h3 class="text-sm font-bold text-rose-400">Clear Storage</h3>
          <p class="text-xs text-slate-400">Wipe all local storage data clean and reset the application state back to zero.</p>
        </div>
        <button 
          @click="handleClearData"
          class="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-semibold transition text-center"
        >
          Wipe Local Data
        </button>
      </div>

    </div>

    <!-- Storage Info Card -->
    <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between text-xs text-slate-400 font-mono">
      <span>Active Storage Engine: <strong class="text-white">HTML5 LocalStorage (Client-Side)</strong></span>
      <span>Total Units Tracked: <strong class="text-blue-400">{{ units.length }}</strong></span>
    </div>

  </div>
</template>