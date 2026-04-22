import type { Scenario, DealOutputs } from '@/types/deal'
import { loanAmount, monthlyPayment, totalCashNeeded } from './financing'
import {
  effectiveMonthlyRent,
  totalMonthlyOperatingExpenses,
  monthlyNOI,
  monthlyCashFlow,
  annualCashFlow,
} from './cashflow'
import { capRate, cashOnCashROI, dscr } from './returns'

export { loanAmount, monthlyPayment, totalCashNeeded } from './financing'
export {
  effectiveMonthlyRent,
  totalMonthlyOperatingExpenses,
  monthlyNOI,
  monthlyCashFlow,
  annualCashFlow,
} from './cashflow'
export { capRate, cashOnCashROI, dscr } from './returns'

/**
 * Main orchestrator — derives all outputs from a single scenario.
 * Pure function: same inputs always produce the same outputs.
 */
export function computeOutputs(scenario: Scenario): DealOutputs {
  const { property, financing, renovation, rental, expenses } = scenario

  const loan = loanAmount(
    property.purchasePrice,
    financing.downPaymentPercent,
    renovation.estimatedCost,
    renovation.financedIntoLoan,
  )

  const payment = monthlyPayment(
    loan,
    financing.interestRate,
    financing.loanTermYears,
  )

  const cash = totalCashNeeded(
    property.purchasePrice,
    financing.downPaymentPercent,
    financing.closingCostPercent,
    renovation.estimatedCost,
    renovation.financedIntoLoan,
  )

  const ownerRent =
    property.strategy === 'house-hack' ? (rental.ownerUnitRent ?? 0) : 0

  const effectiveRent = effectiveMonthlyRent(
    rental.monthlyRent,
    rental.vacancyRatePercent,
    ownerRent,
  )

  const opEx = totalMonthlyOperatingExpenses(expenses, rental.monthlyRent)

  const noi = monthlyNOI(effectiveRent, opEx)

  const monthly = monthlyCashFlow(noi, payment)

  const annual = annualCashFlow(monthly)

  return {
    loanAmount: loan,
    monthlyPayment: payment,
    effectiveMonthlyRent: effectiveRent,
    monthlyOperatingExpenses: opEx,
    monthlyNOI: noi,
    monthlyCashFlow: monthly,
    annualCashFlow: annual,
    capRate: capRate(noi * 12, property.purchasePrice),
    cashOnCashROI: cashOnCashROI(annual, cash),
    dscr: dscr(noi * 12, payment * 12),
    totalCashNeeded: cash,
  }
}
