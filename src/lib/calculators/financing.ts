// All percent parameters are decimals: 0.20 = 20%

/**
 * Loan principal after down payment.
 * If renovation is financed, that cost is added to the loan.
 */
export function loanAmount(
  purchasePrice: number,
  downPaymentPercent: number,
  renovationCost: number,
  financedIntoLoan: boolean,
): number {
  const base = purchasePrice * (1 - downPaymentPercent)
  return base + (financedIntoLoan ? renovationCost : 0)
}

/**
 * Standard fixed-rate amortization payment.
 * Returns 0 for non-positive principal or term.
 * Handles 0% interest rate as simple principal division.
 */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  loanTermYears: number,
): number {
  if (principal <= 0 || loanTermYears <= 0) return 0
  const n = loanTermYears * 12
  if (annualRate <= 0) return principal / n
  const r = annualRate / 12
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/**
 * Upfront cash required to close.
 * Includes down payment, closing costs, and renovation if not financed.
 */
export function totalCashNeeded(
  purchasePrice: number,
  downPaymentPercent: number,
  closingCostPercent: number,
  renovationCost: number,
  financedIntoLoan: boolean,
): number {
  const downPayment = purchasePrice * downPaymentPercent
  const closingCosts = purchasePrice * closingCostPercent
  const outOfPocketReno = financedIntoLoan ? 0 : renovationCost
  return downPayment + closingCosts + outOfPocketReno
}
