export function ProjectCalendarScreen({ calendar }: { calendar: Record<string, number> }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Calendar proyecto</h1>
      <div className="mt-2 space-y-1">
        {Object.keys(calendar).length === 0 ? <p className="text-sm text-slate-500">Sin tareas planificadas.</p> : Object.entries(calendar).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => <div key={day} className="rounded border border-slate-300 px-2 py-1 text-sm">{day}: {count} tareas</div>)}
      </div>
    </section>
  )
}
