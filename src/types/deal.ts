// All percentages are decimals: 0.20 = 20%, 0.07 = 7%, etc.

export type PropertyType =
  | 'single-family'
  | 'duplex'
  | 'triplex'
  | 'fourplex'
  | 'condo'

export type DealStrategy = 'long-term-rental' | 'house-hack'

export interface PropertyInputs {
  address: string
  purchasePrice: number
  propertyType: PropertyType
  strategy: DealStrategy
  squareFeet: number
  bedrooms: number
  bathrooms: number
}

export interface FinancingInputs {
  /** Decimal: 0.20 = 20% down */
  downPaymentPercent: number
  /** Decimal: 0.07 = 7% annual rate */
  interestRate: number
  /** Years: typically 15 or 30 */
  loanTermYears: number
  /** Decimal: 0.03 = 3% of purchase price */
  closingCostPercent: number
}

export interface RenovationInputs {
  /** Total estimated renovation cost in dollars */
  estimatedCost: number
  /** If true, cost is rolled into the loan; otherwise paid out of pocket */
  financedIntoLoan: boolean
}

export interface RentalInputs {
  /** Gross monthly rent collected from tenants */
  monthlyRent: number
  /** Decimal: 0.05 = 5% vacancy */
  vacancyRatePercent: number
  /**
   * House-hack only: market rent for the unit the owner occupies.
   * Treated as imputed income (rent savings) in cash flow calculations.
   */
  ownerUnitRent: number
}

export interface ExpenseInputs {
  propertyTaxMonthly: number
  insuranceMonthly: number
  /** Decimal: 0.05 = 5% of monthly rent */
  maintenancePercent: number
  /** Decimal: 0.08 = 8% of monthly rent; set to 0 if self-managing */
  managementPercent: number
  utilitiesMonthly: number
  hoaMonthly: number
  otherMonthly: number
}

export interface Scenario {
  id: string
  name: string
  property: PropertyInputs
  financing: FinancingInputs
  renovation: RenovationInputs
  rental: RentalInputs
  expenses: ExpenseInputs
}

/** All values are dollar amounts or ratios. Never stored — always derived. */
export interface DealOutputs {
  loanAmount: number
  monthlyPayment: number
  /** Monthly rent after vacancy loss + owner unit imputed rent */
  effectiveMonthlyRent: number
  monthlyOperatingExpenses: number
  /** Net Operating Income per month (before debt service) */
  monthlyNOI: number
  monthlyCashFlow: number
  annualCashFlow: number
  /** Annual NOI / purchase price */
  capRate: number
  /** Annual cash flow / total cash invested */
  cashOnCashROI: number
  /** Annual NOI / annual debt service */
  dscr: number
  /** Down payment + closing costs + out-of-pocket renovation */
  totalCashNeeded: number
}
