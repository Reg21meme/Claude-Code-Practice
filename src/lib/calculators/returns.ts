// All returned values are decimal ratios: 0.08 = 8%

/**
 * Cap Rate — measures property yield independent of financing.
 * Formula: Annual NOI / Purchase Price
 * Returns 0 if purchase price is zero or negative.
 */
export function capRate(annualNOI: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0
  return annualNOI / purchasePrice
}

/**
 * Cash-on-Cash ROI — measures return on actual cash invested.
 * Formula: Annual Cash Flow / Total Cash Needed
 * Returns 0 if no cash was invested.
 */
export function cashOnCashROI(
  annualCashFlow: number,
  totalCashNeeded: number,
): number {
  if (totalCashNeeded <= 0) return 0
  return annualCashFlow / totalCashNeeded
}

/**
 * Debt Service Coverage Ratio — measures how well NOI covers debt payments.
 * Formula: Annual NOI / Annual Debt Service
 * Values above 1.0 mean the property covers its own mortgage.
 * Returns 0 if there is no debt service.
 */
export function dscr(annualNOI: number, annualDebtService: number): number {
  if (annualDebtService <= 0) return 0
  return annualNOI / annualDebtService
}
