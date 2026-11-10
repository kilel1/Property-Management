import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);

export function useAuth() {
  const checkAuth = () => {
    const session = localStorage.getItem('rent_ledger_authenticated');
    isAuthenticated.value = session === 'true';
  };

  onMounted(() => {
    checkAuth();
  });

  const login = (email: string, pass: string): boolean => {
    // Simple mock authentication check (or custom credentials)
    if (email.trim() && pass.trim()) {
      isAuthenticated.value = true;
      localStorage.setItem('rent_ledger_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    isAuthenticated.value = false;
    localStorage.removeItem('rent_ledger_authenticated');
  };

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}