import { useState } from 'react'
import type { DisponibilidadVm } from '../../types/AppUiModels'
import { SegmentRulesService } from '../../../dominio/servicios/SegmentRulesService'

type SegmentsScreenProps = {
  disponibilidadName: string
  disponibilidadStartDate: string
  disponibilidadEndDate: string
  segments: DisponibilidadVm['segments']
  segName: string
  segDescription: string
  segStart: string
  segEnd: string
  segDates: string
  segDaysWeek: string
  segDaysMonth: string
  segExclusions: string
  onSegDescriptionChange: (value: string) => void
  onSegNameChange: (value: string) => void
  onSegStartChange: (value: string) => void
  onSegEndChange: (value: string) => void
  onSegDatesChange: (value: string) => void
  onSegDaysWeekChange: (value: string) => void
  onSegDaysMonthChange: (value: string) => void
  onSegExclusionsChange: (value: string) => void
  onAddSegment: () => void
  onUpdateSegment: (
    segmentId: string,
    data: {
      name: string
      description: string
      startTime: string
      endTime: string
      specificDates: string
      exclusionDates: string
      daysOfWeek: string
      daysOfMonth: string
    },
  ) => void
  busy: boolean
  error: string | null
}

export function SegmentsScreen({
  disponibilidadName,
  disponibilidadStartDate,
  disponibilidadEndDate,
  segments,
  segName,
  segDescription,
  segStart,
  segEnd,
  segDates,
  segDaysWeek,
  segDaysMonth,
  segExclusions,
  onSegDescriptionChange,
  onSegNameChange,
  onSegStartChange,
  onSegEndChange,
  onSegDatesChange,
  onSegDaysWeekChange,
  onSegDaysMonthChange,
  onSegExclusionsChange,
  onAddSegment,
  onUpdateSegment,
  busy,
  error,
}: SegmentsScreenProps) {
  const [specificDateInput, setSpecificDateInput] = useState('')
  const [exclusionDateInput, setExclusionDateInput] = useState('')
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editDates, setEditDates] = useState('')
  const [editExclusions, setEditExclusions] = useState('')
  const [editDaysWeek, setEditDaysWeek] = useState('')
  const [editDaysMonth, setEditDaysMonth] = useState('')

  const analysis = SegmentRulesService.analyzeDraft({
    startTime: segStart,
    endTime: segEnd,
    specificDatesRaw: segDates,
    exclusionDatesRaw: segExclusions,
    daysOfWeekRaw: segDaysWeek,
    daysOfMonthRaw: segDaysMonth,
  })
  const parsedSpecificDates = analysis.specificDates
  const parsedExclusions = analysis.exclusionDates
  const parsedDaysOfWeek = analysis.daysOfWeek
  const parsedDaysOfMonth = analysis.daysOfMonth
  const conflictDates = analysis.conflictDates
  const crossesMidnight = analysis.crossesMidnight
  const hasRules = analysis.hasRules
  const weekdays = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mie' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sab' },
    { value: 7, label: 'Dom' },
  ]

  const updateDates = (dates: string[]) => onSegDatesChange(dates.join(','))
  const updateExclusions = (dates: string[]) => onSegExclusionsChange(dates.join(','))
  const updateWeekdays = (days: number[]) => onSegDaysWeekChange(days.join(','))
  const updateMonthdays = (days: number[]) => onSegDaysMonthChange(days.join(','))

  const addSpecificDate = () => {
    if (!specificDateInput) return
    if (parsedSpecificDates.includes(specificDateInput)) return
    updateDates([...parsedSpecificDates, specificDateInput].sort())
    setSpecificDateInput('')
  }

  const removeSpecificDate = (date: string) => {
    updateDates(parsedSpecificDates.filter((item) => item !== date))
  }

  const addExclusionDate = () => {
    if (!exclusionDateInput) return
    if (parsedExclusions.includes(exclusionDateInput)) return
    updateExclusions([...parsedExclusions, exclusionDateInput].sort())
    setExclusionDateInput('')
  }

  const removeExclusionDate = (date: string) => {
    updateExclusions(parsedExclusions.filter((item) => item !== date))
  }

  const toggleWeekday = (day: number) => {
    const exists = parsedDaysOfWeek.includes(day)
    const next = exists
      ? parsedDaysOfWeek.filter((item) => item !== day)
      : [...parsedDaysOfWeek, day]
    updateWeekdays(next.sort((a, b) => a - b))
  }

  const toggleMonthday = (day: number) => {
    const exists = parsedDaysOfMonth.includes(day)
    const next = exists
      ? parsedDaysOfMonth.filter((item) => item !== day)
      : [...parsedDaysOfMonth, day]
    updateMonthdays(next.sort((a, b) => a - b))
  }

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Segmentos</h1>
      <p className="text-xs text-slate-600">
        Disponibilidad: {disponibilidadName} | Rango: {disponibilidadStartDate} a{' '}
        {disponibilidadEndDate}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
          <p className="text-sm font-semibold">Segmentos existentes</p>
          <div className="mt-2 space-y-2">
            {segments.length === 0 ? (
              <p className="text-xs text-slate-500">Aun no hay segmentos.</p>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="rounded-lg border border-slate-300 bg-white p-2">
                  {editingSegmentId === segment.id ? (
                    <div className="space-y-2">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        placeholder="Nombre"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        placeholder="Descripcion"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          value={editStart}
                          onChange={(event) => setEditStart(event.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                        <input
                          type="time"
                          value={editEnd}
                          onChange={(event) => setEditEnd(event.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                      </div>
                      <input
                        value={editDates}
                        onChange={(event) => setEditDates(event.target.value)}
                        placeholder="Fechas CSV (YYYY-MM-DD)"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        value={editExclusions}
                        onChange={(event) => setEditExclusions(event.target.value)}
                        placeholder="Exclusiones CSV"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        value={editDaysWeek}
                        onChange={(event) => setEditDaysWeek(event.target.value)}
                        placeholder="Dias semana CSV (1-7)"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <input
                        value={editDaysMonth}
                        onChange={(event) => setEditDaysMonth(event.target.value)}
                        placeholder="Dias mes CSV (1-31)"
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSegment(segment.id, {
                              name: editName,
                              description: editDescription,
                              startTime: editStart,
                              endTime: editEnd,
                              specificDates: editDates,
                              exclusionDates: editExclusions,
                              daysOfWeek: editDaysWeek,
                              daysOfMonth: editDaysMonth,
                            })
                            setEditingSegmentId(null)
                          }}
                          disabled={busy}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSegmentId(null)}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold">{segment.name}</p>
                      <p className="text-[11px] text-slate-600">
                        {segment.startTime} - {segment.endTime}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        reglas: {segment.specificDates.length + segment.daysOfWeek.length + segment.daysOfMonth.length}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        exclusiones: {segment.exclusionDates.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSegmentId(segment.id)
                          setEditName(segment.name)
                          setEditDescription(segment.description)
                          setEditStart(segment.startTime)
                          setEditEnd(segment.endTime)
                          setEditDates(segment.specificDates.join(','))
                          setEditExclusions(segment.exclusionDates.join(','))
                          setEditDaysWeek(segment.daysOfWeek.join(','))
                          setEditDaysMonth(segment.daysOfMonth.join(','))
                        }}
                        className="mt-1 rounded border border-slate-300 px-2 py-1 text-[11px]"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-300 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input value={segName} onChange={(e) => onSegNameChange(e.target.value)} placeholder="Nombre segmento" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input value={segDescription} onChange={(e) => onSegDescriptionChange(e.target.value)} placeholder="Descripcion (opcional)" className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input type="time" value={segStart} onChange={(e) => onSegStartChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
            <input type="time" value={segEnd} onChange={(e) => onSegEndChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div className="rounded-lg border border-slate-300 p-3">
            <p className="text-sm font-semibold">Reglas de aplicacion</p>
            <div className="mt-2 grid gap-3 lg:grid-cols-2">
              <div className="rounded border border-slate-300 p-2">
                <p className="text-xs font-semibold">Fechas especificas</p>
                <div className="mt-1 flex gap-2">
                  <input
                    type="date"
                    value={specificDateInput}
                    onChange={(e) => setSpecificDateInput(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button type="button" onClick={addSpecificDate} className="rounded border border-slate-300 px-2 py-1 text-xs">Agregar</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {parsedSpecificDates.map((date) => (
                    <button key={date} type="button" onClick={() => removeSpecificDate(date)} className="rounded border border-slate-300 px-2 py-1 text-[11px]">
                      {date} x
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded border border-slate-300 p-2">
                <p className="text-xs font-semibold">Dias de semana</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {weekdays.map((day) => {
                    const active = parsedDaysOfWeek.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekday(day.value)}
                        className={`rounded border px-2 py-1 text-xs ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded border border-slate-300 p-2 lg:col-span-2">
                <p className="text-xs font-semibold">Dias del mes</p>
                <div className="mt-2 grid grid-cols-10 gap-1">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
                    const active = parsedDaysOfMonth.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleMonthday(day)}
                        className={`rounded border px-1 py-1 text-[11px] ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'}`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded border border-slate-300 p-2 lg:col-span-2">
                <p className="text-xs font-semibold">Exclusiones</p>
                <div className="mt-1 flex gap-2">
                  <input
                    type="date"
                    value={exclusionDateInput}
                    onChange={(e) => setExclusionDateInput(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button type="button" onClick={addExclusionDate} className="rounded border border-slate-300 px-2 py-1 text-xs">Agregar</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {parsedExclusions.map((date) => (
                    <button key={date} type="button" onClick={() => removeExclusionDate(date)} className="rounded border border-slate-300 px-2 py-1 text-[11px]">
                      {date} x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
            <p className="text-sm font-semibold">Vista previa</p>
            <p className="text-xs text-slate-600">
              Reglas activas: {parsedSpecificDates.length + parsedDaysOfWeek.length + parsedDaysOfMonth.length}
            </p>
            <p className="text-xs text-slate-600">Exclusiones: {parsedExclusions.length}</p>
            <p className="text-xs text-slate-600">
              Cruza medianoche: {crossesMidnight ? 'Si' : 'No'}
            </p>
            {!hasRules ? (
              <p className="text-xs text-rose-600">Debes definir al menos una regla.</p>
            ) : null}
            {conflictDates.length > 0 ? (
              <p className="text-xs text-amber-700">
                Conflicto reglas/exclusiones en: {conflictDates.join(', ')} (gana exclusion).
              </p>
            ) : null}
          </div>

          <button type="button" onClick={onAddSegment} disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Agregar segmento</button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
      </div>
    </section>
  )
}
