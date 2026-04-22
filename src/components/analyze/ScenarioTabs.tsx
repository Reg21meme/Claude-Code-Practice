interface ScenarioTabsProps {
  names: string[]
  activeIndex: number
  onSwitch: (index: number) => void
}

export default function ScenarioTabs({ names, activeIndex, onSwitch }: ScenarioTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
      {names.map((name, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSwitch(i)}
          className={[
            'flex-1 text-xs sm:text-sm font-medium py-2.5 px-3 rounded-lg transition-all',
            i === activeIndex
              ? 'bg-white text-indigo-600 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60',
          ].join(' ')}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
