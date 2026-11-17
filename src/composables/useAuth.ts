// src/composables/useAuth.ts
import { ref, computed } from 'vue';

export type UserRole = 'admin' | 'owner' | 'manager';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  orgId: string;
  organization: string;
}

const ACCOUNTS_KEY = 'rent_ledger_accounts_v1';
const SESSION_KEY = 'rent_ledger_user';

// Seed your Admin account by default so you always have platform access
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'admin-1',
    name: 'Brian Kibet',
    email: 'admin@rentledger.co.ke',
    password: 'admin123',
    role: 'admin',
    orgId: 'hq',
    organization: 'Rent Ledger HQ',
  },
];

const getAccounts = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(ACCOUNTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
};

const getStoredSession = (): UserAccount | null => {
  try {
    const item = localStorage.getItem(SESSION_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const accounts = ref<UserAccount[]>(getAccounts());
const currentUser = ref<UserAccount | null>(getStoredSession());

export function useAuth() {
  const isAuthenticated = computed(
    () => Boolean(currentUser.value) && localStorage.getItem('rent_ledger_authenticated') === 'true'
  );

  const isAdmin = computed(() => currentUser.value?.role === 'admin');
  const isOwner = computed(() => currentUser.value?.role === 'owner');
  const isManager = computed(() => currentUser.value?.role === 'manager');

  // Register a new Property Owner or Caretaker
  const register = (payload: {
    name: string;
    email: string;
    password: string;
    role: 'owner' | 'manager';
    organization: string;
  }): { ok: boolean; error?: string } => {
    const email = payload.email.trim().toLowerCase();
    const orgName = payload.organization.trim();

    if (!payload.name.trim() || !email || !payload.password.trim() || !orgName) {
      return { ok: false, error: 'All fields are required.' };
    }

    if (accounts.value.some((a) => a.email.toLowerCase() === email)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    // Generate or match orgId so Caretakers link to their Owner's agency
    const existingOrg = accounts.value.find(
      (a) => a.organization.toLowerCase() === orgName.toLowerCase() && a.role === 'owner'
    );

    if (payload.role === 'manager' && !existingOrg) {
      return {
        ok: false,
        error: 'Agency/Property not found. Ask your Property Owner to register the agency first.',
      };
    }

    const orgId = existingOrg
      ? existingOrg.orgId
      : `org-${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newAccount: UserAccount = {
      id: `user-${Date.now()}`,
      name: payload.name.trim(),
      email,
      password: payload.password,
      role: payload.role,
      orgId,
      organization: existingOrg ? existingOrg.organization : orgName,
    };

    accounts.value.push(newAccount);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.value));

    // Auto sign-in after registration
    const { password: _, ...safeUser } = newAccount;
    currentUser.value = safeUser;
    localStorage.setItem('rent_ledger_authenticated', 'true');
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

    return { ok: true };
  };

  // Real Email + Password Login
  const login = (email: string, password: string): { ok: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();
    const match = accounts.value.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password
    );

    if (!match) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const { password: _, ...safeUser } = match;
    currentUser.value = safeUser;
    localStorage.setItem('rent_ledger_authenticated', 'true');
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return { ok: true };
  };

  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('rent_ledger_authenticated');
    localStorage.removeItem(SESSION_KEY);
  };

  return {
    currentUser,
    accounts,
    isAuthenticated,
    isAdmin,
    isOwner,
    isManager,
    register,
    login,
    logout,
  };
}