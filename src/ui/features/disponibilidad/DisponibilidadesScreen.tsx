import type { DisponibilidadVm } from '../../types/AppUiModels'

type DisponibilidadesScreenProps = {
  dispName: string
  dispDescription: string
  dispStart: string
  dispEnd: string
  onDispNameChange: (value: string) => void
  onDispDescriptionChange: (value: string) => void
  onDispStartChange: (value: string) => void
  onDispEndChange: (value: string) => void
  onCreate: () => void
  busy: boolean
  error: string | null
  disponibilidades: DisponibilidadVm[]
  onOpenSegments: (disponibilidadId: string) => void
  onOpenCalendar: (disponibilidadId: string) => void
}

export function DisponibilidadesScreen({
  dispName,
  dispDescription,
  dispStart,
  dispEnd,
  onDispNameChange,
  onDispDescriptionChange,
  onDispStartChange,
  onDispEndChange,
  onCreate,
  busy,
  error,
  disponibilidades,
  onOpenSegments,
  onOpenCalendar,
}: DisponibilidadesScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Disponibilidades</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input value={dispName} onChange={(e) => onDispNameChange(e.target.value)} placeholder="Nombre" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input value={dispDescription} onChange={(e) => onDispDescriptionChange(e.target.value)} placeholder="Descripcion" className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={dispStart} onChange={(e) => onDispStartChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={dispEnd} onChange={(e) => onDispEndChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <button type="button" onClick={onCreate} disabled={busy} className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Crear disponibilidad</button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {disponibilidades.map((disp) => (
          <div key={disp.id} className="rounded border border-slate-300 p-2 text-sm">
            <p>{disp.name} ({disp.startDate} - {disp.endDate})</p>
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => onOpenSegments(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Segmentos</button>
              <button type="button" onClick={() => onOpenCalendar(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Calendar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
