import type { Scenario } from '@/types/deal'

export interface SavedDeal {
  id: string
  name: string
  scenarios: Scenario[]
  activeIndex: number
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

const KEY = 'dealscope_deals'

function readRaw(): SavedDeal[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as SavedDeal[]) : []
  } catch {
    return []
  }
}

function writeRaw(deals: SavedDeal[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(deals))
  } catch {
    // Storage may be full or unavailable
  }
}

export function loadAllDeals(): SavedDeal[] {
  return readRaw()
}

export function getDeal(id: string): SavedDeal | null {
  return readRaw().find((d) => d.id === id) ?? null
}

export function saveDeal(deal: SavedDeal): void {
  const deals = readRaw()
  const idx = deals.findIndex((d) => d.id === deal.id)
  if (idx >= 0) {
    deals[idx] = deal
  } else {
    deals.push(deal)
  }
  writeRaw(deals)
}

export function deleteDeal(id: string): void {
  writeRaw(readRaw().filter((d) => d.id !== id))
}

export function renameDeal(id: string, name: string): void {
  const deals = readRaw()
  const idx = deals.findIndex((d) => d.id === id)
  if (idx < 0) return
  deals[idx] = { ...deals[idx], name, updatedAt: new Date().toISOString() }
  writeRaw(deals)
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
