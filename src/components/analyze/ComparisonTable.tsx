import { Fragment } from 'react'
import type { DealOutputs } from '@/types/deal'

// ─── Formatting helpers ────────────────────────────────────────────────────

const fmtDollar = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

const fmtSignedDollar = (n: number) => (n >= 0 ? '+' : '') + fmtDollar(n)
const fmtPct = (n: number) => (n * 100).toFixed(2) + '%'
const fmtSignedPct = (n: number) => (n >= 0 ? '+' : '') + (n * 100).toFixed(2) + '%'
const fmtMultiplier = (n: number) => n.toFixed(2) + 'x'

// ─── Value-based text colors (mirrors OutputsPanel thresholds) ─────────────

const cashFlowColor = (n: number) => (n >= 0 ? 'text-emerald-700' : 'text-red-600')
const capRateColor = (n: number) =>
  n >= 0.08 ? 'text-emerald-700' : n >= 0.05 ? 'text-amber-600' : 'text-red-600'
const cocColor = (n: number) =>
  n >= 0.1 ? 'text-emerald-700' : n >= 0.05 ? 'text-amber-600' : 'text-red-600'
const dscrColor = (n: number) =>
  n >= 1.25 ? 'text-emerald-700' : n >= 1.0 ? 'text-amber-600' : 'text-red-600'

// ─── Best-value detection ──────────────────────────────────────────────────

type Direction = 'higher' | 'lower'

function bestIndices(values: number[], direction: Direction): Set<number> {
  const target = direction === 'higher' ? Math.max(...values) : Math.min(...values)
  // If all values are identical, don't highlight any
  if (values.every((v) => v === target)) return new Set()
  return new Set(values.flatMap((v, i) => (v === target ? [i] : [])))
}

// ─── Metric config ─────────────────────────────────────────────────────────

interface MetricConfig {
  label: string
  getValue: (o: DealOutputs) => number
  format: (n: number) => string
  direction: Direction
  colorFn?: (n: number) => string
}

const groups: { title: string; metrics: MetricConfig[] }[] = [
  {
    title: 'Financing',
    metrics: [
      {
        label: 'Total Cash Needed',
        getValue: (o) => o.totalCashNeeded,
        format: fmtDollar,
        direction: 'lower',
      },
      {
        label: 'Monthly Payment',
        getValue: (o) => o.monthlyPayment,
        format: fmtDollar,
        direction: 'lower',
      },
    ],
  },
  {
    title: 'Cash Flow',
    metrics: [
      {
        label: 'Monthly Cash Flow',
        getValue: (o) => o.monthlyCashFlow,
        format: fmtSignedDollar,
        direction: 'higher',
        colorFn: cashFlowColor,
      },
      {
        label: 'Annual Cash Flow',
        getValue: (o) => o.annualCashFlow,
        format: fmtSignedDollar,
        direction: 'higher',
        colorFn: cashFlowColor,
      },
    ],
  },
  {
    title: 'Returns',
    metrics: [
      {
        label: 'Cap Rate',
        getValue: (o) => o.capRate,
        format: fmtPct,
        direction: 'higher',
        colorFn: capRateColor,
      },
      {
        label: 'Cash-on-Cash ROI',
        getValue: (o) => o.cashOnCashROI,
        format: fmtSignedPct,
        direction: 'higher',
        colorFn: cocColor,
      },
      {
        label: 'DSCR',
        getValue: (o) => o.dscr,
        format: fmtMultiplier,
        direction: 'higher',
        colorFn: dscrColor,
      },
    ],
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

interface ComparisonTableProps {
  names: string[]
  outputs: DealOutputs[]
  activeIndex: number
}

export default function ComparisonTable({ names, outputs, activeIndex }: ComparisonTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Scenario Comparison</h2>
        <p className="mt-0.5 text-sm text-slate-500">All three scenarios side by side</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-44">
                Metric
              </th>
              {names.map((name, i) => (
                <th
                  key={i}
                  className={[
                    'py-3 px-5 text-right text-xs font-semibold uppercase tracking-wider',
                    i === activeIndex ? 'text-indigo-600' : 'text-slate-400',
                  ].join(' ')}
                >
                  {name}
                  {i === activeIndex && (
                    <span className="block text-[10px] normal-case tracking-normal font-normal text-indigo-400 mt-0.5">
                      editing
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <td
                    colSpan={outputs.length + 1}
                    className="px-5 pt-5 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {group.title}
                  </td>
                </tr>

                {group.metrics.map((metric) => {
                  const values = outputs.map(metric.getValue)
                  const best = bestIndices(values, metric.direction)

                  return (
                    <tr key={metric.label} className="border-t border-slate-50">
                      <td className="py-2.5 px-5 text-sm text-slate-500">{metric.label}</td>
                      {values.map((value, i) => {
                        const isBest = best.has(i)
                        const isActive = i === activeIndex
                        const bgClass = isBest
                          ? 'bg-emerald-50'
                          : isActive
                            ? 'bg-indigo-50/40'
                            : ''
                        const textClass = metric.colorFn
                          ? metric.colorFn(value)
                          : isBest
                            ? 'text-emerald-700'
                            : 'text-slate-700'

                        return (
                          <td
                            key={i}
                            className={`py-2.5 px-5 text-sm text-right tabular-nums ${bgClass}`}
                          >
                            <span
                              className={[textClass, isBest ? 'font-semibold' : '']
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {metric.format(value)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Bottom padding row */}
        <div className="h-4" />
      </div>
    </div>
  )
}
