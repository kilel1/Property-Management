import { ref, onMounted } from 'vue';

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
  email?: string;
}

const profile = ref<UserProfile>({
  name: 'Brian Kibet',
  role: 'Administrator',
  initials: 'BK',
  email: 'brian@gmail.com'
});

export function useProfile() {
  const saveProfile = () => {
    localStorage.setItem('rent_ledger_user_profile', JSON.stringify(profile.value));
  };

  onMounted(() => {
    const saved = localStorage.getItem('rent_ledger_user_profile');
    if (saved) {
      profile.value = JSON.parse(saved);
    }
  });

  const updateProfile = (updated: UserProfile) => {
    profile.value = updated;
    // Automatically generate initials if name changes
    const parts = updated.name.trim().split(' ');
    if (parts.length >= 2) {
      profile.value.initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0]) {
      profile.value.initials = parts[0].substring(0, 2).toUpperCase();
    }
    saveProfile();
  };

  return {
    profile,
    updateProfile,
  };
}