import type { CalendarDayCellVm } from '../types/CalendarViewModels'

type ProjectMonthGridProps = {
  cells: CalendarDayCellVm[]
  selectedDay: string | null
  onSelectDay: (isoDate: string) => void
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

export function ProjectMonthGrid({
  cells,
  selectedDay,
  onSelectDay,
}: ProjectMonthGridProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3">
      <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((label) => (
          <div key={label} className="rounded border border-slate-200 bg-slate-50 p-2 text-center text-xs font-semibold text-slate-600">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const active = selectedDay === cell.isoDate
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(cell.isoDate)}
              className={`min-h-20 rounded border p-2 text-left ${
                active
                  ? 'border-slate-900 bg-slate-100'
                  : cell.inCurrentMonth
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{cell.dayNumber}</span>
                <span className="text-[10px] text-slate-600">{cell.taskCount} bloques</span>
              </div>
              {cell.previewTitles.length > 0 ? (
                <div className="mt-1 space-y-0.5">
                  {cell.previewTitles.map((title) => (
                    <p key={`${cell.isoDate}-${title}`} className="truncate text-[10px] text-slate-700">
                      {title}
                    </p>
                  ))}
                  {cell.previewOverflow > 0 ? (
                    <p className="text-[10px] text-slate-500">+{cell.previewOverflow} más</p>
                  ) : null}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
