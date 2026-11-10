import { ref, computed, onMounted } from 'vue';

export interface Payment {
  id: string;
  receipt_number: string;
  amount: number;
  method: string;
  reference: string;
  month: string;
  date: string;
  is_reversed: boolean;
}

export interface Unit {
  id: string;
  property_name: string; // Added property grouping (e.g. Property A, Property B)
  unit_number: string;
  rent_amount: number;
  tenant_name: string;
  tenant_phone: string;
  is_vacant: boolean;
  payments: Payment[];
}

const units = ref<Unit[]>([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));

export function formatKSh(amount: number): string {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
}

export function useRentLedger() {
  const saveToStorage = () => {
    localStorage.setItem('rent_ledger_local_units_v3', JSON.stringify(units.value));
  };

  onMounted(() => {
    const saved = localStorage.getItem('rent_ledger_local_units_v3');
    if (saved) {
      units.value = JSON.parse(saved);
    } else {
      units.value = [
        { id: '1', property_name: 'Property A', unit_number: 'A1', rent_amount: 25000, tenant_name: 'Brian Kipet', tenant_phone: '+254712345678', is_vacant: false, payments: [] },
        { id: '2', property_name: 'Property A', unit_number: 'A2', rent_amount: 30000, tenant_name: '', tenant_phone: '', is_vacant: true, payments: [] },
        { id: '3', property_name: 'Property B', unit_number: 'B1', rent_amount: 40000, tenant_name: 'Jane Doe', tenant_phone: '+254798765432', is_vacant: false, payments: [] },
      ];
      saveToStorage();
    }
  });

  // Dynamically get a list of unique property names (e.g., ['Property A', 'Property B'])
  const properties = computed(() => {
    const set = new Set(units.value.map(u => u.property_name));
    return Array.from(set);
  });

  const stats = computed(() => {
    let totalBilled = 0;
    let totalCollected = 0;
    let occupiedCount = 0;

    units.value.forEach(u => {
      if (!u.is_vacant) {
        occupiedCount++;
        totalBilled += Number(u.rent_amount);
        const paid = (u.payments || []).reduce((acc, p) => acc + (p.month === selectedMonth.value && !p.is_reversed ? Number(p.amount) : 0), 0);
        totalCollected += paid;
      }
    });

    return {
      totalUnits: units.value.length,
      occupiedUnits: occupiedCount,
      occupancyRate: units.value.length ? Math.round((occupiedCount / units.value.length) * 100) : 0,
      totalCollected,
      totalOutstanding: Math.max(0, totalBilled - totalCollected),
      collectionRate: totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0,
    };
  });

  const processedUnits = computed(() => {
    return units.value.map(u => {
      if (u.is_vacant) {
        return { ...u, totalPaid: 0, balanceDue: 0, status: 'VACANT' };
      }
      const unitPaid = (u.payments || []).reduce((acc, p) => acc + (p.month === selectedMonth.value && !p.is_reversed ? Number(p.amount) : 0), 0);
      const balanceDue = Math.max(0, Number(u.rent_amount) - unitPaid);
      
      let status = 'PAID';
      if (balanceDue === Number(u.rent_amount)) status = 'DUE';
      else if (balanceDue > 0) status = 'PARTIAL';

      return { ...u, totalPaid: unitPaid, balanceDue, status };
    });
  });

  const addUnit = (unitData: Omit<Unit, 'id' | 'payments'>) => {
    units.value.push({
      ...unitData,
      id: Date.now().toString(),
      payments: [],
    });
    saveToStorage();
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    const idx = units.value.findIndex(u => u.id === id);
    if (idx !== -1) {
      units.value[idx] = { ...units.value[idx], ...updates };
      saveToStorage();
    }
  };

  const deleteUnit = (id: string) => {
    units.value = units.value.filter(u => u.id !== id);
    saveToStorage();
  };

  const recordPayment = (unitId: string, payload: { amount: number; method: string; reference: string }) => {
    const idx = units.value.findIndex(u => u.id === unitId);
    if (idx !== -1) {
      const receiptNum = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      const newPayment: Payment = {
        id: Date.now().toString(),
        receipt_number: receiptNum,
        amount: payload.amount,
        method: payload.method,
        reference: payload.reference,
        month: selectedMonth.value,
        date: new Date().toLocaleDateString(),
        is_reversed: false,
      };
      if (!units.value[idx].payments) units.value[idx].payments = [];
      units.value[idx].payments.push(newPayment);
      saveToStorage();
      return newPayment;
    }
    return null;
  };

  const reversePayment = (unitId: string, paymentId: string) => {
    const uIdx = units.value.findIndex(u => u.id === unitId);
    if (uIdx !== -1) {
      const pIdx = units.value[uIdx].payments.findIndex(p => p.id === paymentId);
      if (pIdx !== -1) {
        units.value[uIdx].payments[pIdx].is_reversed = true;
        saveToStorage();
      }
    }
  };

  return {
    units,
    properties,
    selectedMonth,
    stats,
    processedUnits,
    addUnit,
    updateUnit,
    deleteUnit,
    recordPayment,
    reversePayment,
  };
}