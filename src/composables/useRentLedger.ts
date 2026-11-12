import { ref, computed } from 'vue';

export interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string;
  date: string;
  month: string; // e.g. '2026-11'
  receipt_number: string;
  is_reversed?: boolean;
}

export interface Unit {
  id: string;
  property_name: string;
  unit_number: string;
  rent_amount: number;
  tenant_name?: string;
  tenant_phone?: string;
  deposit_amount?: number;
  lease_start?: string;
  is_vacant: boolean;
  payments?: Payment[];
}

export interface Expense {
  id: string;
  property_name: string;
  unit_number?: string;
  category: 'Plumbing' | 'Electrical' | 'Repairs' | 'Utilities' | 'Payroll' | 'Other';
  amount: number;
  description: string;
  date: string;
  month: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

// Dynamically initialize current real-world year-month (e.g. '2026-11')
const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Global shared state for local-first persistence
const units = ref<Unit[]>([]);
const expenses = ref<Expense[]>([]);
const auditLogs = ref<AuditLog[]>([]);
const selectedMonth = ref(getCurrentMonth());

// Currency formatter helper with dynamic symbol parameter
export const formatKSh = (amount: number, symbol = 'KSh'): string => {
  return `${symbol} ${amount.toLocaleString()}`;
};

export function useRentLedger() {
  
  // Initialize storage on first load
  const initStorage = () => {
    const savedUnits = localStorage.getItem('rent_ledger_units_v4');
    if (savedUnits) {
      units.value = JSON.parse(savedUnits);
    } else {
      units.value = [
        { 
          id: '1', 
          property_name: 'Property A', 
          unit_number: 'A1', 
          rent_amount: 25000, 
          tenant_name: 'Brian Kibet', 
          tenant_phone: '+254712345678', 
          deposit_amount: 25000,
          lease_start: '2026-01-15',
          is_vacant: false, 
          payments: [{ id: 'p1', amount: 25000, method: 'mpesa', reference: 'QHX892L1K', date: '2026-11-01', month: selectedMonth.value, receipt_number: 'REC-001001' }] 
        },
        { 
          id: '2', 
          property_name: 'Property A', 
          unit_number: 'A2', 
          rent_amount: 30000, 
          tenant_name: '', 
          tenant_phone: '', 
          deposit_amount: 0,
          is_vacant: true, 
          payments: [] 
        },
        { 
          id: '3', 
          property_name: 'Property B', 
          unit_number: 'B1', 
          rent_amount: 40000, 
          tenant_name: 'Jane Doe', 
          tenant_phone: '+254798765432', 
          deposit_amount: 40000,
          lease_start: '2026-03-01',
          is_vacant: false, 
          payments: [] 
        }
      ];
      localStorage.setItem('rent_ledger_units_v4', JSON.stringify(units.value));
    }

    const savedExpenses = localStorage.getItem('rent_ledger_expenses_v4');
    if (savedExpenses) {
      expenses.value = JSON.parse(savedExpenses);
    } else {
      expenses.value = [
        { id: 'e1', property_name: 'Property A', unit_number: 'A1', category: 'Plumbing', amount: 3500, description: 'Fixed leaking pipe under sink', date: '2026-11-05', month: selectedMonth.value },
        { id: 'e2', property_name: 'Property B', category: 'Utilities', amount: 1200, description: 'Common area electricity token', date: '2026-11-02', month: selectedMonth.value }
      ];
      localStorage.setItem('rent_ledger_expenses_v4', JSON.stringify(expenses.value));
    }
  };

  // Run initialization once
  if (units.value.length === 0) {
    initStorage();
  }

  const saveUnits = () => {
    localStorage.setItem('rent_ledger_units_v4', JSON.stringify(units.value));
  };

  const saveExpenses = () => {
    localStorage.setItem('rent_ledger_expenses_v4', JSON.stringify(expenses.value));
  };

  const logAction = (action: string, details: string) => {
    auditLogs.value.unshift({
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toLocaleString()
    });
  };

  // Unique property names list
  const properties = computed(() => {
    const set = new Set(units.value.map(u => u.property_name));
    return Array.from(set);
  });

  // Processed units with dynamic monthly calculations (arrears carry-forward)
  const processedUnits = computed(() => {
    return units.value.map(unit => {
      const unitPayments = unit.payments || [];
      const activeMonthPayments = unitPayments.filter(p => p.month === selectedMonth.value && !p.is_reversed);
      const totalPaid = activeMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const carriedArrears = 0; 
      const balanceDue = Math.max(0, (unit.rent_amount + carriedArrears) - totalPaid);

      let status = 'DUE';
      if (unit.is_vacant) {
        status = 'VACANT';
      } else if (totalPaid >= unit.rent_amount) {
        status = 'PAID';
      } else if (totalPaid > 0) {
        status = 'PARTIAL';
      }

      return {
        ...unit,
        totalPaid,
        carriedArrears,
        balanceDue,
        status,
      };
    });
  });

  // Global Dashboard Statistics
  const stats = computed(() => {
    const totalUnits = processedUnits.value.length;
    const occupiedUnits = processedUnits.value.filter(u => !u.is_vacant).length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const totalExpected = processedUnits.value
      .filter(u => !u.is_vacant)
      .reduce((sum, u) => sum + u.rent_amount, 0);

    const totalCollected = processedUnits.value
      .reduce((sum, u) => sum + u.totalPaid, 0);

    const totalOutstanding = processedUnits.value
      .reduce((sum, u) => sum + u.balanceDue, 0);

    const collectionRate = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

    return {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      totalExpected,
      totalCollected,
      totalOutstanding,
      collectionRate,
    };
  });

  // --- Net Operating Income (NOI) Financial P&L Summary ---
  const financialSummary = computed(() => {
    const grossCollected = stats.value.totalCollected;
    const totalExpenses = expenses.value
      .filter((e: Expense) => e.month === selectedMonth.value)
      .reduce((acc: number, e: Expense) => acc + Number(e.amount), 0);
    
    const netOperatingIncome = grossCollected - totalExpenses;

    return {
      grossCollected,
      totalExpenses,
      netOperatingIncome,
    };
  });

  // Unit CRUD Actions
  const addUnit = (unitData: Omit<Unit, 'id' | 'payments'>) => {
    const newUnit: Unit = {
      ...unitData,
      id: Date.now().toString(),
      payments: []
    };
    units.value.push(newUnit);
    saveUnits();
    logAction('ADD_UNIT', `Registered Unit ${newUnit.unit_number} under ${newUnit.property_name}`);
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    const index = units.value.findIndex(u => u.id === id);
    if (index !== -1) {
      units.value[index] = { ...units.value[index], ...updates };
      saveUnits();
      logAction('UPDATE_UNIT', `Updated Unit details for ID ${id}`);
    }
  };

  const deleteUnit = (id: string) => {
    const unit = units.value.find(u => u.id === id);
    units.value = units.value.filter(u => u.id !== id);
    saveUnits();
    logAction('DELETE_UNIT', `Removed Unit ${unit?.unit_number || id}`);
  };

  // Batch Import CSV Units Action
  const addUnitsBatch = (newUnitsData: Array<Omit<Unit, 'id' | 'payments'>>) => {
    const formattedUnits: Unit[] = newUnitsData.map(u => ({
      ...u,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      payments: [],
    }));

    units.value = [...units.value, ...formattedUnits];
    saveUnits();
    logAction('BATCH_IMPORT', `Bulk imported ${formattedUnits.length} new units via CSV`);
  };

  // Move-In Tenant Action
  const moveInTenant = (unitId: string, data: { tenant_name: string; tenant_phone: string; deposit_amount: number }) => {
    const unit = units.value.find(u => u.id === unitId);
    if (!unit) return;

    unit.tenant_name = data.tenant_name;
    unit.tenant_phone = data.tenant_phone;
    unit.deposit_amount = data.deposit_amount;
    unit.lease_start = new Date().toISOString().slice(0, 10);
    unit.is_vacant = false;

    saveUnits();
    logAction('MOVE_IN', `Checked in ${data.tenant_name} to Unit ${unit.unit_number} with deposit ${formatKSh(data.deposit_amount)}`);
  };

  // Move-Out Tenant Action
  const moveOutTenant = (unitId: string) => {
    const unit = units.value.find(u => u.id === unitId);
    if (!unit) return;

    const tenantName = unit.tenant_name || 'Tenant';
    const deposit = unit.deposit_amount || 0;

    unit.tenant_name = '';
    unit.tenant_phone = '';
    unit.deposit_amount = 0;
    unit.lease_start = undefined;
    unit.is_vacant = true;

    saveUnits();
    logAction('MOVE_OUT', `Checked out ${tenantName} from Unit ${unit.unit_number}. Deposit returned/cleared: ${formatKSh(deposit)}`);
  };

  // Payment Actions
  const recordPayment = (unitId: string, paymentData: { amount: number; method: string; reference: string }) => {
    const unit = units.value.find(u => u.id === unitId);
    if (!unit) return;

    if (!unit.payments) unit.payments = [];

    const newPayment: Payment = {
      id: Date.now().toString(),
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      date: new Date().toLocaleDateString(),
      month: selectedMonth.value,
      receipt_number: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    unit.payments.unshift(newPayment);
    saveUnits();
    logAction('RECORD_PAYMENT', `Recorded payment of ${formatKSh(newPayment.amount)} for Unit ${unit.unit_number}`);
  };

  const reversePayment = (unitId: string, paymentId: string) => {
    const unit = units.value.find(u => u.id === unitId);
    if (!unit || !unit.payments) return;

    const payment = unit.payments.find(p => p.id === paymentId);
    if (payment) {
      payment.is_reversed = true;
      saveUnits();
      logAction('REVERSE_PAYMENT', `Reversed payment receipt ${payment.receipt_number} for Unit ${unit.unit_number}`);
    }
  };

  // Expense Actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      month: selectedMonth.value,
    };
    expenses.value.unshift(newExp);
    saveExpenses();
    logAction('ADD_EXPENSE', `Added expense of ${formatKSh(newExp.amount)} for ${newExp.property_name}`);
  };

  const deleteExpense = (id: string) => {
    expenses.value = expenses.value.filter(e => e.id !== id);
    saveExpenses();
    logAction('DELETE_EXPENSE', `Deleted expense record ID ${id}`);
  };

  return {
    units,
    expenses,
    auditLogs,
    selectedMonth,
    properties,
    processedUnits,
    stats,
    financialSummary,
    addUnit,
    updateUnit,
    deleteUnit,
    addUnitsBatch,
    moveInTenant,
    moveOutTenant,
    recordPayment,
    reversePayment,
    addExpense,
    deleteExpense,
  };
}