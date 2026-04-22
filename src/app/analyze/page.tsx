'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Scenario } from '@/types/deal'
import { computeOutputs } from '@/lib/calculators'
import { validateScenario } from '@/lib/validators/deal'
import PropertySection from '@/components/analyze/PropertySection'
import FinancingSection from '@/components/analyze/FinancingSection'
import RenovationSection from '@/components/analyze/RenovationSection'
import RentalSection from '@/components/analyze/RentalSection'
import ExpenseSection from '@/components/analyze/ExpenseSection'
import OutputsPanel from '@/components/analyze/OutputsPanel'
import ScenarioTabs from '@/components/analyze/ScenarioTabs'
import ComparisonTable from '@/components/analyze/ComparisonTable'

// Partial update for the active scenario — id and name are immutable
type ScenarioPatch = Partial<Omit<Scenario, 'id' | 'name'>>

// ─── Default scenarios ────────────────────────────────────────────────────
// Each scenario starts with a different rent, vacancy, rate, and expense
// assumption so the comparison table is immediately useful out of the box.

const defaultScenarios: Scenario[] = [
  {
    id: '0',
    name: 'Base Case',
    property: {
      address: '',
      purchasePrice: 350000,
      propertyType: 'single-family',
      strategy: 'long-term-rental',
      squareFeet: 1400,
      bedrooms: 3,
      bathrooms: 2,
    },
    financing: {
      downPaymentPercent: 0.2,
      interestRate: 0.07,
      loanTermYears: 30,
      closingCostPercent: 0.03,
    },
    renovation: { estimatedCost: 0, financedIntoLoan: false },
    rental: { monthlyRent: 2200, vacancyRatePercent: 0.05, ownerUnitRent: 0 },
    expenses: {
      propertyTaxMonthly: 350,
      insuranceMonthly: 125,
      maintenancePercent: 0.05,
      managementPercent: 0.08,
      utilitiesMonthly: 0,
      hoaMonthly: 0,
      otherMonthly: 0,
    },
  },
  {
    id: '1',
    name: 'Optimistic',
    property: {
      address: '',
      purchasePrice: 350000,
      propertyType: 'single-family',
      strategy: 'long-term-rental',
      squareFeet: 1400,
      bedrooms: 3,
      bathrooms: 2,
    },
    financing: {
      downPaymentPercent: 0.2,
      interestRate: 0.07,
      loanTermYears: 30,
      closingCostPercent: 0.03,
    },
    renovation: { estimatedCost: 0, financedIntoLoan: false },
    // Higher rent, lower vacancy, self-managing
    rental: { monthlyRent: 2500, vacancyRatePercent: 0.03, ownerUnitRent: 0 },
    expenses: {
      propertyTaxMonthly: 350,
      insuranceMonthly: 125,
      maintenancePercent: 0.05,
      managementPercent: 0,
      utilitiesMonthly: 0,
      hoaMonthly: 0,
      otherMonthly: 0,
    },
  },
  {
    id: '2',
    name: 'Conservative',
    property: {
      address: '',
      purchasePrice: 350000,
      propertyType: 'single-family',
      strategy: 'long-term-rental',
      squareFeet: 1400,
      bedrooms: 3,
      bathrooms: 2,
    },
    // Slightly higher rate to model a worse financing outcome
    financing: {
      downPaymentPercent: 0.2,
      interestRate: 0.075,
      loanTermYears: 30,
      closingCostPercent: 0.03,
    },
    renovation: { estimatedCost: 0, financedIntoLoan: false },
    // Lower rent, higher vacancy, higher maintenance
    rental: { monthlyRent: 1950, vacancyRatePercent: 0.08, ownerUnitRent: 0 },
    expenses: {
      propertyTaxMonthly: 350,
      insuranceMonthly: 125,
      maintenancePercent: 0.08,
      managementPercent: 0.08,
      utilitiesMonthly: 0,
      hoaMonthly: 0,
      otherMonthly: 0,
    },
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios)
  const [activeIndex, setActiveIndex] = useState(0)

  const active = scenarios[activeIndex]
  const allOutputs = scenarios.map(computeOutputs)
  const errors = validateScenario(active)

  const updateActive = (patch: ScenarioPatch) =>
    setScenarios((prev) => {
      const next = [...prev]
      next[activeIndex] = { ...next[activeIndex], ...patch }
      return next
    })

  const names = scenarios.map((s) => s.name)

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors"
          >
            DealScope
          </Link>
          <span className="text-sm text-slate-400 hidden sm:block">Deal Analyzer</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analyze a Deal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Switch scenarios to compare assumptions. Outputs and the table below update as you type.
          </p>
        </div>

        <ScenarioTabs names={names} activeIndex={activeIndex} onSwitch={setActiveIndex} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            <PropertySection
              values={active.property}
              errors={errors.property}
              onChange={(property) => updateActive({ property })}
            />
            <FinancingSection
              values={active.financing}
              errors={errors.financing}
              onChange={(financing) => updateActive({ financing })}
            />
            <RenovationSection
              values={active.renovation}
              errors={errors.renovation}
              onChange={(renovation) => updateActive({ renovation })}
            />
            <RentalSection
              values={active.rental}
              errors={errors.rental}
              onChange={(rental) => updateActive({ rental })}
              strategy={active.property.strategy}
            />
            <ExpenseSection
              values={active.expenses}
              errors={errors.expenses}
              onChange={(expenses) => updateActive({ expenses })}
            />
          </div>

          <div className="lg:sticky lg:top-[72px]">
            <OutputsPanel outputs={allOutputs[activeIndex]} />
          </div>
        </div>

        <ComparisonTable names={names} outputs={allOutputs} activeIndex={activeIndex} />
      </main>
    </div>
  )
}
