import { useState } from 'react'
import type { DisponibilidadVm } from '../../types/AppUiModels'

const formatHoursAndMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.floor(minutes))
  const hours = Math.floor(safeMinutes / 60)
  const rest = safeMinutes % 60
  return `${hours} h ${rest} min`
}

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
  onUpdate: (
    disponibilidadId: string,
    data: {
      name: string
      description: string
      startDate: string
      endDate: string
    },
  ) => void
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
  onUpdate,
  busy,
  error,
  disponibilidades,
  onOpenSegments,
  onOpenCalendar,
}: DisponibilidadesScreenProps) {
  const [editingDisponibilidadId, setEditingDisponibilidadId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingStartDate, setEditingStartDate] = useState('')
  const [editingEndDate, setEditingEndDate] = useState('')

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
            {editingDisponibilidadId === disp.id ? (
              <div className="space-y-2">
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  value={editingDescription}
                  onChange={(event) => setEditingDescription(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    value={editingStartDate}
                    onChange={(event) => setEditingStartDate(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="date"
                    value={editingEndDate}
                    onChange={(event) => setEditingEndDate(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(disp.id, {
                        name: editingName,
                        description: editingDescription,
                        startDate: editingStartDate,
                        endDate: editingEndDate,
                      })
                      setEditingDisponibilidadId(null)
                      setEditingName('')
                      setEditingDescription('')
                      setEditingStartDate('')
                      setEditingEndDate('')
                    }}
                    disabled={busy}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDisponibilidadId(null)
                      setEditingName('')
                      setEditingDescription('')
                      setEditingStartDate('')
                      setEditingEndDate('')
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{disp.name} ({disp.startDate} - {disp.endDate})</p>
                <p className="text-xs text-slate-600">
                  Tiempo usable restante: {formatHoursAndMinutes(disp.remainingUsableMinutes)} ({disp.remainingUsableMinutes} min)
                </p>
                <div className="mt-1 flex gap-2">
                  <button type="button" onClick={() => onOpenSegments(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Segmentos</button>
                  <button type="button" onClick={() => onOpenCalendar(disp.id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Calendar</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDisponibilidadId(disp.id)
                      setEditingName(disp.name)
                      setEditingDescription(disp.description)
                      setEditingStartDate(disp.startDate)
                      setEditingEndDate(disp.endDate)
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Editar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
