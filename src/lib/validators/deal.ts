import type {
  PropertyInputs,
  FinancingInputs,
  RenovationInputs,
  RentalInputs,
  ExpenseInputs,
  Scenario,
} from '@/types/deal'

// All percent fields are decimals: 0.20 = 20%
// Reasonable percent upper bounds are documented per field.

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export interface ScenarioErrors {
  property: FieldErrors<PropertyInputs>
  financing: FieldErrors<FinancingInputs>
  renovation: FieldErrors<RenovationInputs>
  rental: FieldErrors<RentalInputs>
  expenses: FieldErrors<ExpenseInputs>
}

function isPositive(v: number) {
  return Number.isFinite(v) && v > 0
}

function isNonNegative(v: number) {
  return Number.isFinite(v) && v >= 0
}

function isPercentInRange(v: number, max = 1) {
  return Number.isFinite(v) && v >= 0 && v <= max
}

export function validateProperty(
  p: PropertyInputs,
): FieldErrors<PropertyInputs> {
  const errors: FieldErrors<PropertyInputs> = {}

  if (!p.address || p.address.trim() === '') {
    errors.address = 'Address is required.'
  }

  if (!isPositive(p.purchasePrice)) {
    errors.purchasePrice = 'Purchase price must be greater than 0.'
  }

  if (!isPositive(p.squareFeet)) {
    errors.squareFeet = 'Square footage must be greater than 0.'
  }

  if (!Number.isInteger(p.bedrooms) || p.bedrooms < 0) {
    errors.bedrooms = 'Bedrooms must be a non-negative whole number.'
  }

  if (!Number.isFinite(p.bathrooms) || p.bathrooms < 0) {
    errors.bathrooms = 'Bathrooms must be a non-negative number.'
  }

  return errors
}

export function validateFinancing(
  f: FinancingInputs,
): FieldErrors<FinancingInputs> {
  const errors: FieldErrors<FinancingInputs> = {}

  // Down payment: 0–100% (all-cash allowed at 1.0)
  if (!isPercentInRange(f.downPaymentPercent, 1)) {
    errors.downPaymentPercent = 'Down payment must be between 0% and 100%.'
  }

  // Interest rate: 0–30% (0 allowed for all-cash / seller financing)
  if (!isPercentInRange(f.interestRate, 0.3)) {
    errors.interestRate = 'Interest rate must be between 0% and 30%.'
  }

  // Loan term: 1–50 years
  if (!Number.isInteger(f.loanTermYears) || f.loanTermYears < 1 || f.loanTermYears > 50) {
    errors.loanTermYears = 'Loan term must be a whole number between 1 and 50 years.'
  }

  // Closing costs: 0–10%
  if (!isPercentInRange(f.closingCostPercent, 0.1)) {
    errors.closingCostPercent = 'Closing costs must be between 0% and 10%.'
  }

  return errors
}

export function validateRenovation(
  r: RenovationInputs,
): FieldErrors<RenovationInputs> {
  const errors: FieldErrors<RenovationInputs> = {}

  if (!isNonNegative(r.estimatedCost)) {
    errors.estimatedCost = 'Renovation cost must be 0 or greater.'
  }

  return errors
}

export function validateRental(r: RentalInputs): FieldErrors<RentalInputs> {
  const errors: FieldErrors<RentalInputs> = {}

  if (!isNonNegative(r.monthlyRent)) {
    errors.monthlyRent = 'Monthly rent must be 0 or greater.'
  }

  // Vacancy: 0–100%
  if (!isPercentInRange(r.vacancyRatePercent, 1)) {
    errors.vacancyRatePercent = 'Vacancy rate must be between 0% and 100%.'
  }

  if (!isNonNegative(r.ownerUnitRent)) {
    errors.ownerUnitRent = 'Owner unit rent must be 0 or greater.'
  }

  return errors
}

export function validateExpenses(
  e: ExpenseInputs,
): FieldErrors<ExpenseInputs> {
  const errors: FieldErrors<ExpenseInputs> = {}

  const fixedFields: Array<keyof ExpenseInputs> = [
    'propertyTaxMonthly',
    'insuranceMonthly',
    'utilitiesMonthly',
    'hoaMonthly',
    'otherMonthly',
  ]

  for (const field of fixedFields) {
    if (!isNonNegative(e[field] as number)) {
      errors[field] = 'Must be 0 or greater.'
    }
  }

  // Maintenance: 0–50% of rent
  if (!isPercentInRange(e.maintenancePercent, 0.5)) {
    errors.maintenancePercent = 'Maintenance must be between 0% and 50% of rent.'
  }

  // Management: 0–50% of rent
  if (!isPercentInRange(e.managementPercent, 0.5)) {
    errors.managementPercent = 'Management fee must be between 0% and 50% of rent.'
  }

  return errors
}

/** Validates all sections of a scenario. Returns errors grouped by section. */
export function validateScenario(scenario: Scenario): ScenarioErrors {
  return {
    property: validateProperty(scenario.property),
    financing: validateFinancing(scenario.financing),
    renovation: validateRenovation(scenario.renovation),
    rental: validateRental(scenario.rental),
    expenses: validateExpenses(scenario.expenses),
  }
}

/** Returns true if the scenario has no validation errors. */
export function isScenarioValid(scenario: Scenario): boolean {
  const errors = validateScenario(scenario)
  return Object.values(errors).every(
    (section) => Object.keys(section).length === 0,
  )
}
