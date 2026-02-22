type ProjectListViewProps = {
  calendar: Record<string, number>
  selectedDay: string | null
  onSelectDay: (isoDate: string) => void
}

export function ProjectListView({
  calendar,
  selectedDay,
  onSelectDay,
}: ProjectListViewProps) {
  const entries = Object.entries(calendar).sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-500">
        Sin tareas planificadas para este proyecto.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3">
      <ul className="space-y-2">
        {entries.map(([day, count]) => (
          <li key={day}>
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className={`w-full rounded border px-3 py-2 text-left text-sm ${
                selectedDay === day
                  ? 'border-slate-900 bg-slate-100'
                  : 'border-slate-300 bg-white'
              }`}
            >
              <span className="font-semibold">{day}</span> · {count} tareas
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
