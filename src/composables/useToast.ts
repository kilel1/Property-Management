import { ref } from 'vue';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    toasts.value.push({ id, title, message, type });

    // Automatically remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}