import type { Metadata } from 'next'
import Link from 'next/link'
import Dashboard from '@/components/Dashboard'

export const metadata: Metadata = {
  title: 'DealScope — My Deals',
  description: 'Your saved real estate deal analyses. All data stays in your browser.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900 tracking-tight">DealScope</span>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Deal
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Deals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your saved deal analyses — all stored locally in your browser.
          </p>
        </div>
        <Dashboard />
      </main>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        DealScope · All calculations run locally · No data leaves your browser
      </footer>
    </div>
  )
}
