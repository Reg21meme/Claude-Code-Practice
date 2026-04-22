'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { computeOutputs } from '@/lib/calculators'
import { loadAllDeals, deleteDeal, renameDeal, type SavedDeal } from '@/lib/storage'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (s < 60) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDollar(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

const strategyLabel: Record<string, string> = {
  'long-term-rental': 'Long-Term Rental',
  'house-hack': 'House Hack',
}

// ─── DealCard ──────────────────────────────────────────────────────────────

interface DealCardProps {
  deal: SavedDeal
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

function DealCard({ deal, onOpen, onDelete, onRename }: DealCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(deal.name)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const activeScenario = deal.scenarios[deal.activeIndex] ?? deal.scenarios[0]
  const outputs = computeOutputs(activeScenario)
  const address = activeScenario.property.address.trim()
  const strategy = strategyLabel[activeScenario.property.strategy] ?? activeScenario.property.strategy
  const cashFlowColor = outputs.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'

  const commitRename = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== deal.name) onRename(deal.id, trimmed)
    else setEditName(deal.name)
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors">
      {/* Name + strategy badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setEditName(deal.name)
                  setIsEditing(false)
                }
              }}
              className="w-full text-base font-semibold text-slate-900 border-b-2 border-indigo-400 outline-none bg-transparent pb-0.5"
            />
          ) : (
            <h3
              className="text-base font-semibold text-slate-900 truncate cursor-text hover:text-indigo-600 transition-colors"
              title="Click to rename"
              onClick={() => setIsEditing(true)}
            >
              {deal.name}
            </h3>
          )}
          <p className="text-sm text-slate-400 truncate mt-0.5">
            {address || 'No address set'}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full whitespace-nowrap">
          {strategy}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">
            Monthly Cash Flow
          </p>
          <p className={`text-sm font-semibold tabular-nums ${cashFlowColor}`}>
            {outputs.monthlyCashFlow >= 0 ? '+' : ''}
            {fmtDollar(outputs.monthlyCashFlow)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">
            Cap Rate
          </p>
          <p className="text-sm font-semibold tabular-nums text-slate-700">
            {(outputs.capRate * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Footer: timestamp + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Updated {formatRelativeTime(deal.updatedAt)}
        </span>

        <div className="flex items-center gap-3">
          {confirming ? (
            <>
              <button
                onClick={() => onDelete(deal.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => onOpen(deal.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Open →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
        <svg
          className="w-7 h-7 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">No saved deals yet</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
        Create your first deal to start analyzing rental properties and house-hack scenarios.
        All data stays in your browser.
      </p>
      <Link
        href="/analyze"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Analyze a Deal
      </Link>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const [deals, setDeals] = useState<SavedDeal[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    function init() {
      setDeals(loadAllDeals().slice().reverse()) // newest first
      setLoaded(true)
    }
    init()
  }, [])

  const refresh = () => setDeals(loadAllDeals().slice().reverse())

  const handleDelete = (id: string) => {
    deleteDeal(id)
    refresh()
  }

  const handleRename = (id: string, name: string) => {
    renameDeal(id, name)
    refresh()
  }

  const handleOpen = (id: string) => router.push(`/analyze?id=${id}`)

  // Render nothing until localStorage is read to avoid layout flicker
  if (!loaded) return <div className="h-64" />

  if (deals.length === 0) return <EmptyState />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ))}
    </div>
  )
}
