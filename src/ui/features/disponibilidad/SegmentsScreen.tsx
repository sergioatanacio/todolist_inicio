import { useState } from 'react'
import type { DisponibilidadVm } from '../../types/AppUiModels'

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
  busy,
  error,
}: SegmentsScreenProps) {
  const [specificDateInput, setSpecificDateInput] = useState('')
  const [exclusionDateInput, setExclusionDateInput] = useState('')

  const parsedSpecificDates = segDates
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const parsedExclusions = segExclusions
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  const parsedDaysOfWeek = segDaysWeek
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item))
  const parsedDaysOfMonth = segDaysMonth
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item))
  const conflictDates = parsedSpecificDates.filter((item) =>
    parsedExclusions.includes(item),
  )
  const crossesMidnight = segStart.length > 0 && segEnd.length > 0 && segEnd < segStart
  const hasRules =
    parsedSpecificDates.length > 0 ||
    parsedDaysOfWeek.length > 0 ||
    parsedDaysOfMonth.length > 0
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
