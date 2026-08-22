// ============================================================
// Decimal-Safe Money Utilities
// ============================================================
// All monetary values are stored in PAISE (1/100 of a rupee).
// ₹50,000 = 5_000_000 paise.
// This avoids floating-point errors entirely for storage/comparison.
//
// When calculating percentages, we use the multiply→round→divide
// pattern to minimize floating-point drift:
//   result_paise = Math.round(base_paise * percentage / 100)

/**
 * Convert rupees (human-readable) to paise (storage).
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise (storage) to rupees (human-readable).
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Apply a percentage to a paise amount, returning paise.
 * Uses integer arithmetic to avoid floating-point errors.
 */
export function percentageOfPaise(
  basePaise: number,
  percentage: number
): number {
  // percentage is e.g. 50 for 50%, 8.33 for 8.33%
  // Multiply first, then divide — minimizes precision loss
  return Math.round((basePaise * percentage) / 100);
}

/**
 * Format paise as ₹ string for display.
 */
export function formatCurrency(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
