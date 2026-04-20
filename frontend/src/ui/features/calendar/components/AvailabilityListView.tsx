import type { AvailabilityDayVm } from '../types/CalendarViewModels'

type AvailabilityListViewProps = {
  days: AvailabilityDayVm[]
  selectedDay: string | null
  onSelectDay: (isoDate: string) => void
}

export function AvailabilityListView({
  days,
  selectedDay,
  onSelectDay,
}: AvailabilityListViewProps) {
  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-500">
        No hay bloques planificados en esta disponibilidad.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3">
      <ul className="space-y-2">
        {days.map((day) => (
          <li key={day.isoDate}>
            <button
              type="button"
              onClick={() => onSelectDay(day.isoDate)}
              className={`w-full rounded border px-3 py-2 text-left text-sm ${
                selectedDay === day.isoDate
                  ? 'border-slate-900 bg-slate-100'
                  : 'border-slate-300 bg-white'
              }`}
            >
              <span className="font-semibold">{day.isoDate}</span> · {day.blocks.length}{' '}
              bloques · {day.totalMinutes} min
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
