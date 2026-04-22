'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Scenario } from '@/types/deal'
import { computeOutputs } from '@/lib/calculators'
import { validateScenario } from '@/lib/validators/deal'
import { getDeal, saveDeal, generateId } from '@/lib/storage'
import type { SavedDeal } from '@/lib/storage'
import PropertySection from '@/components/analyze/PropertySection'
import FinancingSection from '@/components/analyze/FinancingSection'
import RenovationSection from '@/components/analyze/RenovationSection'
import RentalSection from '@/components/analyze/RentalSection'
import ExpenseSection from '@/components/analyze/ExpenseSection'
import OutputsPanel from '@/components/analyze/OutputsPanel'
import ScenarioTabs from '@/components/analyze/ScenarioTabs'
import ComparisonTable from '@/components/analyze/ComparisonTable'
import PrintReport from '@/components/analyze/PrintReport'
import { buildReportData } from '@/lib/report'

type ScenarioPatch = Partial<Omit<Scenario, 'id' | 'name'>>
type SaveStatus = 'idle' | 'saved'

// ─── Default scenarios ────────────────────────────────────────────────────

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
    financing: {
      downPaymentPercent: 0.2,
      interestRate: 0.075,
      loanTermYears: 30,
      closingCostPercent: 0.03,
    },
    renovation: { estimatedCost: 0, financedIntoLoan: false },
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function duplicateName(base: string, existing: string[]): string {
  const candidate = `${base} Copy`
  if (!existing.includes(candidate)) return candidate
  let n = 2
  while (existing.includes(`${base} Copy ${n}`)) n++
  return `${base} Copy ${n}`
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dealId, setDealId] = useState<string | null>(null)
  const [dealName, setDealName] = useState('Untitled Deal')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // On mount: read ?id from the URL and load the deal if it exists.
  useEffect(() => {
    function loadFromUrl() {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      if (!id) return
      const deal = getDeal(id)
      if (!deal) {
        // Deal not found — clear the stale param so the URL stays clean.
        window.history.replaceState(null, '', '/analyze')
        return
      }
      setScenarios(deal.scenarios)
      setActiveIndex(deal.activeIndex)
      setDealId(deal.id)
      setDealName(deal.name)
    }
    loadFromUrl()
  }, [])

  const active = scenarios[activeIndex]
  const allOutputs = scenarios.map(computeOutputs)
  const errors = validateScenario(active)
  const names = scenarios.map((s) => s.name)

  const updateActive = (patch: ScenarioPatch) =>
    setScenarios((prev) => {
      const next = [...prev]
      next[activeIndex] = { ...next[activeIndex], ...patch }
      return next
    })

  const handleSave = () => {
    const now = new Date().toISOString()
    const id = dealId ?? generateId()
    const existing = dealId ? getDeal(dealId) : null

    const deal: SavedDeal = {
      id,
      name: dealName.trim() || 'Untitled Deal',
      scenarios,
      activeIndex,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    saveDeal(deal)

    if (!dealId) {
      setDealId(id)
      // Update the URL so a refresh or Back→Forward restores this deal.
      window.history.replaceState(null, '', `/analyze?id=${id}`)
    }

    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleDuplicate = () => {
    if (scenarios.length >= 3) return
    const source = scenarios[activeIndex]
    const newIndex = scenarios.length
    setScenarios((prev) => [
      ...prev,
      { ...source, id: generateId(), name: duplicateName(source.name, prev.map((s) => s.name)) },
    ])
    setActiveIndex(newIndex)
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50 print:hidden">
      {/* Nav */}
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
        {/* Header + deal save toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analyze a Deal</h1>
            <p className="mt-1 text-sm text-slate-500">
              Switch scenarios to compare assumptions. Outputs and the table below update as you type.
            </p>
          </div>

          {/* Save toolbar */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm shrink-0">
            <input
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Name this deal..."
              aria-label="Deal name"
              className="text-sm font-medium text-slate-800 outline-none bg-transparent placeholder:text-slate-400 placeholder:font-normal w-40 sm:w-48"
            />
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={handleSave}
              className={[
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap',
                saveStatus === 'saved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700',
              ].join(' ')}
            >
              {saveStatus === 'saved' ? '✓ Saved' : dealId ? 'Save' : 'Save Deal'}
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={() => window.print()}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ScenarioTabs names={names} activeIndex={activeIndex} onSwitch={setActiveIndex} />
          {scenarios.length < 3 && (
            <button
              onClick={handleDuplicate}
              className="shrink-0 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              + Duplicate
            </button>
          )}
        </div>

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
    <PrintReport data={buildReportData(dealName, scenarios, activeIndex)} />
    </>
  )
}
