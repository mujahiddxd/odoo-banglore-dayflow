// ============================================================
// Centralized Salary Calculation Engine
// ============================================================
// This is the AUTHORITATIVE salary computation engine.
// The frontend may show live previews, but the backend engine
// is the single source of truth.
//
// All monetary values are in PAISE.
// Calculation dependency order:
//   1. Basic Salary      = % of Monthly Wage
//   2. HRA               = % of Basic Salary
//   3. Standard Allowance = Fixed Amount
//   4. Performance Bonus  = % of Basic Salary
//   5. LTA               = % of Basic Salary
//   6. Fixed Allowance   = Monthly Wage - sum(1..5)
//
// PF is calculated from Basic Salary (not wage).
// Professional Tax is a separate employee deduction.

import type {
  SalaryConfig,
  SalaryComponentConfig,
  ComputedSalary,
} from './types';
import { percentageOfPaise } from './money';

/**
 * Compute all salary component amounts from configuration.
 * Returns a new SalaryConfig with computedAmount set on each component,
 * plus the full ComputedSalary breakdown.
 */
export function calculateSalary(config: SalaryConfig): ComputedSalary {
  const { monthlyWage, components } = config;

  // Sort by order to ensure dependency resolution
  const sorted = [...components].sort((a, b) => a.order - b.order);

  // First pass: compute Basic (we need it for components that depend on it)
  let basicSalary = 0;
  const computed: SalaryComponentConfig[] = [];

  for (const comp of sorted) {
    let amount = 0;

    switch (comp.name) {
      case 'Basic Salary': {
        // Always % of Wage
        if (comp.calculationType !== 'PERCENTAGE' || comp.calculationBasis !== 'WAGE') {
          throw new Error('Basic Salary must be PERCENTAGE of WAGE');
        }
        amount = percentageOfPaise(monthlyWage, comp.value);
        basicSalary = amount;
        break;
      }

      case 'House Rent Allowance': {
        // Always % of Basic
        if (comp.calculationType !== 'PERCENTAGE' || comp.calculationBasis !== 'BASIC') {
          throw new Error('HRA must be PERCENTAGE of BASIC');
        }
        amount = percentageOfPaise(basicSalary, comp.value);
        break;
      }

      case 'Standard Allowance': {
        // Always FIXED amount
        if (comp.calculationType !== 'FIXED') {
          throw new Error('Standard Allowance must be FIXED');
        }
        amount = comp.value; // value is already in paise
        break;
      }

      case 'Performance Bonus': {
        // % of Basic
        if (comp.calculationType !== 'PERCENTAGE' || comp.calculationBasis !== 'BASIC') {
          throw new Error('Performance Bonus must be PERCENTAGE of BASIC');
        }
        amount = percentageOfPaise(basicSalary, comp.value);
        break;
      }

      case 'Leave Travel Allowance': {
        // % of Basic
        if (comp.calculationType !== 'PERCENTAGE' || comp.calculationBasis !== 'BASIC') {
          throw new Error('LTA must be PERCENTAGE of BASIC');
        }
        amount = percentageOfPaise(basicSalary, comp.value);
        break;
      }

      case 'Fixed Allowance': {
        // REMAINING_BALANCE — skip for now, compute after loop
        amount = 0;
        break;
      }

      default: {
        // Generic component: compute based on type
        if (comp.calculationType === 'PERCENTAGE') {
          const base =
            comp.calculationBasis === 'WAGE'
              ? monthlyWage
              : comp.calculationBasis === 'BASIC'
                ? basicSalary
                : 0;
          amount = percentageOfPaise(base, comp.value);
        } else if (comp.calculationType === 'FIXED') {
          amount = comp.value;
        }
        break;
      }
    }

    computed.push({ ...comp, computedAmount: amount });
  }

  // Compute Fixed Allowance as remaining balance
  const sumWithoutFixed = computed
    .filter((c) => c.name !== 'Fixed Allowance')
    .reduce((sum, c) => sum + c.computedAmount, 0);

  const fixedAllowance = monthlyWage - sumWithoutFixed;

  // Update Fixed Allowance in computed array
  const finalComponents = computed.map((c) =>
    c.name === 'Fixed Allowance'
      ? { ...c, computedAmount: fixedAllowance }
      : c
  );

  // PF calculations (from Basic, not wage)
  const employeePF = percentageOfPaise(basicSalary, config.pfEmployeeRate);
  const employerPF = percentageOfPaise(basicSalary, config.pfEmployerRate);

  // Professional Tax
  const professionalTax = config.professionalTaxActive
    ? config.professionalTax
    : 0;

  // Deductions = Employee PF + Professional Tax
  const totalDeductions = employeePF + professionalTax;

  // Net = Gross - Employee Deductions (employer PF is NOT deducted)
  const netSalary = monthlyWage - totalDeductions;

  return {
    monthlyWage,
    yearlyWage: monthlyWage * 12,
    components: finalComponents,
    employeePF,
    employerPF,
    professionalTax,
    totalDeductions,
    netSalary,
    grossSalary: monthlyWage,
  };
}

/**
 * Validate salary configuration before saving.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateSalaryConfig(config: SalaryConfig): string | null {
  if (config.monthlyWage <= 0) {
    return 'Monthly wage must be positive.';
  }

  if (config.monthlyWage > 1000000000) { // 1 Crore INR in paise
    return 'Monthly wage cannot exceed ₹1,00,00,000 (1 Crore).';
  }

  // Compute to check for negative fixed allowance
  const computed = calculateSalary(config);

  const fixedAllowanceComp = computed.components.find(
    (c) => c.name === 'Fixed Allowance'
  );

  if (fixedAllowanceComp && fixedAllowanceComp.computedAmount < 0) {
    return 'Invalid configuration: salary components exceed the monthly wage. Fixed Allowance would be negative.';
  }

  // Verify total equals monthly wage
  const total = computed.components.reduce(
    (sum, c) => sum + c.computedAmount,
    0
  );

  // Allow a 1 paise tolerance for rounding
  if (Math.abs(total - config.monthlyWage) > 1) {
    return `Salary components total (${total}) does not match monthly wage (${config.monthlyWage}).`;
  }

  return null;
}

/**
 * Create default salary component configurations.
 * Values are the standard defaults; admin can customize.
 */
export function createDefaultComponents(): SalaryComponentConfig[] {
  return [
    {
      name: 'Basic Salary',
      calculationType: 'PERCENTAGE',
      calculationBasis: 'WAGE',
      value: 50,
      computedAmount: 0,
      editable: true,
      order: 1,
    },
    {
      name: 'House Rent Allowance',
      calculationType: 'PERCENTAGE',
      calculationBasis: 'BASIC',
      value: 50,
      computedAmount: 0,
      editable: true,
      order: 2,
    },
    {
      name: 'Standard Allowance',
      calculationType: 'FIXED',
      calculationBasis: 'NONE',
      value: 416700, // ₹4,167 in paise
      computedAmount: 0,
      editable: true,
      order: 3,
    },
    {
      name: 'Performance Bonus',
      calculationType: 'PERCENTAGE',
      calculationBasis: 'BASIC',
      value: 8.33,
      computedAmount: 0,
      editable: true,
      order: 4,
    },
    {
      name: 'Leave Travel Allowance',
      calculationType: 'PERCENTAGE',
      calculationBasis: 'BASIC',
      value: 8.33,
      computedAmount: 0,
      editable: true,
      order: 5,
    },
    {
      name: 'Fixed Allowance',
      calculationType: 'REMAINING_BALANCE',
      calculationBasis: 'WAGE',
      value: 0,
      computedAmount: 0,
      editable: false, // Auto-calculated, never manually entered
      order: 6,
    },
  ];
}
