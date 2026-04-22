import type { ExpenseInputs } from '@/types/deal'

// All percent parameters are decimals: 0.05 = 5%

/**
 * Monthly income after vacancy loss.
 * For house-hacks, ownerUnitRent is added as imputed income (rent savings).
 */
export function effectiveMonthlyRent(
  monthlyRent: number,
  vacancyRatePercent: number,
  ownerUnitRent = 0,
): number {
  return monthlyRent * (1 - vacancyRatePercent) + ownerUnitRent
}

/**
 * Sum of all monthly operating expenses (excludes mortgage debt service).
 * Maintenance and management are percentage-based on gross monthly rent.
 */
export function totalMonthlyOperatingExpenses(
  expenses: ExpenseInputs,
  grossMonthlyRent: number,
): number {
  const fixed =
    expenses.propertyTaxMonthly +
    expenses.insuranceMonthly +
    expenses.utilitiesMonthly +
    expenses.hoaMonthly +
    expenses.otherMonthly

  const variable =
    (expenses.maintenancePercent + expenses.managementPercent) * grossMonthlyRent

  return fixed + variable
}

/** Net Operating Income per month — before debt service. */
export function monthlyNOI(
  effectiveRent: number,
  operatingExpenses: number,
): number {
  return effectiveRent - operatingExpenses
}

/** Cash remaining after operating expenses and mortgage payment. */
export function monthlyCashFlow(noi: number, payment: number): number {
  return noi - payment
}

export function annualCashFlow(monthly: number): number {
  return monthly * 12
}
