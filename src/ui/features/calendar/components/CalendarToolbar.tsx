import type { ReactNode } from 'react'
import type { CalendarViewMode } from '../types/CalendarViewModels'

type CalendarToolbarProps = {
  title: string
  viewMode: CalendarViewMode
  onChangeViewMode: (mode: CalendarViewMode) => void
  rightSlot?: ReactNode
}

export function CalendarToolbar({
  title,
  viewMode,
  onChangeViewMode,
  rightSlot,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-600">Vista y navegacion de calendario.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChangeViewMode('month')}
          className={`rounded px-3 py-1 text-xs font-semibold ${
            viewMode === 'month'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700'
          }`}
        >
          Mes
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode('list')}
          className={`rounded px-3 py-1 text-xs font-semibold ${
            viewMode === 'list'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 bg-white text-slate-700'
          }`}
        >
          Lista
        </button>
        {rightSlot}
      </div>
    </div>
  )
}
