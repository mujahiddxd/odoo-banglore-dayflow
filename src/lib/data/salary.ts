// ============================================================
// Salary Data Store (In-Memory for Hackathon Demo)
// ============================================================

import type { SalaryConfig, SalaryHistoryEntry } from '../types';
import { createDefaultComponents, calculateSalary } from '../salary-engine';
import { rupeesToPaise } from '../money';

// ---- Helper to create a salary config for an employee ----

function createSalaryConfig(
  employeeId: string,
  monthlyWageRupees: number
): SalaryConfig {
  const monthlyWage = rupeesToPaise(monthlyWageRupees);
  return {
    employeeId,
    wageType: 'FIXED_WAGE',
    monthlyWage,
    yearlyWage: monthlyWage * 12,
    components: createDefaultComponents(),
    pfEmployeeRate: 12,
    pfEmployerRate: 12,
    professionalTax: rupeesToPaise(200), // ₹200/month
    professionalTaxActive: true,
    workingDaysPerWeek: 5,
    breakTimeHours: 1,
  };
}

// ---- Seed salary configs ----

const salaryStore: Map<string, SalaryConfig> = new Map([
  ['emp-001', createSalaryConfig('emp-001', 75000)],
  ['emp-002', createSalaryConfig('emp-002', 50000)],
  ['emp-003', createSalaryConfig('emp-003', 45000)],
]);

// Pre-compute amounts for seed data
for (const [id, config] of salaryStore) {
  const computed = calculateSalary(config);
  config.components = computed.components;
  config.yearlyWage = computed.yearlyWage;
  salaryStore.set(id, config);
}

// ---- Salary history ----

const historyStore: Map<string, SalaryHistoryEntry[]> = new Map([
  ['emp-001', []],
  ['emp-002', []],
  ['emp-003', []],
]);

// ---- Data Access Functions ----

export function getSalaryConfig(employeeId: string): SalaryConfig | undefined {
  let config = salaryStore.get(employeeId);
  if (!config) {
    config = createSalaryConfig(employeeId, 50000);
    const computed = calculateSalary(config);
    config.components = computed.components;
    config.yearlyWage = computed.yearlyWage;
    salaryStore.set(employeeId, config);
  }
  return config;
}

export function updateSalaryConfig(
  employeeId: string,
  newConfig: SalaryConfig,
  changedBy: string,
  changedByName: string,
  reason: string = ''
): SalaryConfig {
  const previous = salaryStore.get(employeeId);

  // Recalculate via the engine (never trust frontend amounts)
  const computed = calculateSalary(newConfig);
  const updatedConfig: SalaryConfig = {
    ...newConfig,
    components: computed.components,
    yearlyWage: computed.yearlyWage,
  };

  // Save history if there was a previous config
  if (previous) {
    const historyEntry: SalaryHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      employeeId,
      previousConfig: { ...previous },
      newConfig: { ...updatedConfig },
      effectiveDate: new Date().toISOString().split('T')[0],
      changedBy,
      changedByName,
      timestamp: new Date().toISOString(),
      reason,
    };

    const history = historyStore.get(employeeId) ?? [];
    history.unshift(historyEntry);
    historyStore.set(employeeId, history);
  }

  salaryStore.set(employeeId, updatedConfig);
  return updatedConfig;
}

export function getSalaryHistory(
  employeeId: string
): SalaryHistoryEntry[] {
  return historyStore.get(employeeId) ?? [];
}
