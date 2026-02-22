import { DateRange } from '../valores_objeto/DateRange'
import { DayOfMonthSet } from '../valores_objeto/DayOfMonthSet'
import { DayOfWeekSet } from '../valores_objeto/DayOfWeekSet'
import { SpecificDateSet } from '../valores_objeto/SpecificDateSet'
import { TimeRange } from '../valores_objeto/TimeRange'

type SegmentoHorarioPrimitives = {
  id: string
  startTime: string
  endTime: string
  specificDates: string[]
  daysOfWeek: number[]
  daysOfMonth: number[]
}

type DisponibilidadPrimitives = {
  id: string
  workspaceId: string
  startDate: string
  endDate: string
  segments: SegmentoHorarioPrimitives[]
  createdAt: number
}

type SegmentInterval = {
  startMs: number
  endMs: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

const parseIsoDate = (raw: string): Date => {
  const date = new Date(`${raw}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha invalida')
  }
  if (date.toISOString().slice(0, 10) !== raw) {
    throw new Error('Fecha invalida')
  }
  return date
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const dayOfWeekToDomain = (date: Date) => {
  const raw = date.getUTCDay()
  return raw === 0 ? 7 : raw
}

class SegmentoHorario {
  private readonly _id: string
  private readonly _timeRange: TimeRange
  private readonly _specificDates: SpecificDateSet
  private readonly _daysOfWeek: DayOfWeekSet
  private readonly _daysOfMonth: DayOfMonthSet

  private constructor(data: {
    id: string
    timeRange: TimeRange
    specificDates: SpecificDateSet
    daysOfWeek: DayOfWeekSet
    daysOfMonth: DayOfMonthSet
  }) {
    this._id = data.id
    this._timeRange = data.timeRange
    this._specificDates = data.specificDates
    this._daysOfWeek = data.daysOfWeek
    this._daysOfMonth = data.daysOfMonth
  }

  static create(data: {
    startTime: string
    endTime: string
    specificDates?: string[]
    daysOfWeek?: number[]
    daysOfMonth?: number[]
  }) {
    return SegmentoHorario.rehydrate({
      id: crypto.randomUUID(),
      startTime: data.startTime,
      endTime: data.endTime,
      specificDates: data.specificDates ?? [],
      daysOfWeek: data.daysOfWeek ?? [],
      daysOfMonth: data.daysOfMonth ?? [],
    })
  }

  static rehydrate(data: SegmentoHorarioPrimitives) {
    const specificDates = SpecificDateSet.create(data.specificDates)
    const daysOfWeek = DayOfWeekSet.create(data.daysOfWeek)
    const daysOfMonth = DayOfMonthSet.create(data.daysOfMonth)
    const hasRule =
      specificDates.toArray().length > 0 ||
      daysOfWeek.toArray().length > 0 ||
      daysOfMonth.toArray().length > 0
    if (!hasRule) {
      throw new Error('Un segmento debe tener al menos una regla de aplicacion')
    }
    return new SegmentoHorario({
      id: data.id,
      timeRange: TimeRange.create(data.startTime, data.endTime),
      specificDates,
      daysOfWeek,
      daysOfMonth,
    })
  }

  appliesTo(baseDate: Date) {
    const iso = toIsoDate(baseDate)
    return (
      this._specificDates.has(iso) ||
      this._daysOfWeek.has(dayOfWeekToDomain(baseDate)) ||
      this._daysOfMonth.has(baseDate.getUTCDate())
    )
  }

  expandIntervals(baseDate: Date): SegmentInterval[] {
    if (!this.appliesTo(baseDate)) return []
    const baseDayStartMs = Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      0,
      0,
      0,
      0,
    )
    const ranges = this._timeRange.splitByMidnight()
    if (!this._timeRange.crossesMidnight) {
      return [
        {
          startMs: baseDayStartMs + ranges[0].startMinutes * MINUTE_MS,
          endMs: baseDayStartMs + ranges[0].endMinutes * MINUTE_MS,
        },
      ]
    }
    return [
      {
        startMs: baseDayStartMs + ranges[0].startMinutes * MINUTE_MS,
        endMs: baseDayStartMs + ranges[0].endMinutes * MINUTE_MS,
      },
      {
        startMs: baseDayStartMs + DAY_MS + ranges[1].startMinutes * MINUTE_MS,
        endMs: baseDayStartMs + DAY_MS + ranges[1].endMinutes * MINUTE_MS,
      },
    ]
  }

  toPrimitives(): SegmentoHorarioPrimitives {
    return {
      id: this._id,
      startTime: this._timeRange.start,
      endTime: this._timeRange.end,
      specificDates: this._specificDates.toArray(),
      daysOfWeek: this._daysOfWeek.toArray(),
      daysOfMonth: this._daysOfMonth.toArray(),
    }
  }

  get id() {
    return this._id
  }
}

export class DisponibilidadAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _dateRange: DateRange
  private readonly _segments: readonly SegmentoHorario[]
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    workspaceId: string
    dateRange: DateRange
    segments: readonly SegmentoHorario[]
    createdAt: number
  }) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._dateRange = data.dateRange
    this._segments = data.segments
    this._createdAt = data.createdAt
  }

  static create(data: {
    workspaceId: string
    startDate: string
    endDate: string
    segments?: Array<{
      startTime: string
      endTime: string
      specificDates?: string[]
      daysOfWeek?: number[]
      daysOfMonth?: number[]
    }>
  }) {
    return new DisponibilidadAggregate({
      id: crypto.randomUUID(),
      workspaceId: data.workspaceId,
      dateRange: DateRange.create(data.startDate, data.endDate),
      segments: (data.segments ?? []).map((segment) =>
        SegmentoHorario.create(segment),
      ),
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: DisponibilidadPrimitives) {
    return new DisponibilidadAggregate({
      id: data.id,
      workspaceId: data.workspaceId,
      dateRange: DateRange.create(data.startDate, data.endDate),
      segments: data.segments.map((segment) => SegmentoHorario.rehydrate(segment)),
      createdAt: data.createdAt,
    })
  }

  changeDateRange(startDate: string, endDate: string) {
    return new DisponibilidadAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      dateRange: DateRange.create(startDate, endDate),
      segments: this._segments,
      createdAt: this._createdAt,
    })
  }

  addSegment(data: {
    startTime: string
    endTime: string
    specificDates?: string[]
    daysOfWeek?: number[]
    daysOfMonth?: number[]
  }) {
    return new DisponibilidadAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      dateRange: this._dateRange,
      segments: [...this._segments, SegmentoHorario.create(data)],
      createdAt: this._createdAt,
    })
  }

  removeSegment(segmentId: string) {
    return new DisponibilidadAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      dateRange: this._dateRange,
      segments: this._segments.filter((segment) => segment.id !== segmentId),
      createdAt: this._createdAt,
    })
  }

  replaceSegment(
    segmentId: string,
    data: {
      startTime: string
      endTime: string
      specificDates?: string[]
      daysOfWeek?: number[]
      daysOfMonth?: number[]
    },
  ) {
    const next = this._segments.map((segment) =>
      segment.id === segmentId
        ? SegmentoHorario.rehydrate({
            id: segmentId,
            startTime: data.startTime,
            endTime: data.endTime,
            specificDates: data.specificDates ?? [],
            daysOfWeek: data.daysOfWeek ?? [],
            daysOfMonth: data.daysOfMonth ?? [],
          })
        : segment,
    )
    return new DisponibilidadAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      dateRange: this._dateRange,
      segments: next,
      createdAt: this._createdAt,
    })
  }

  calcularMinutosValidos() {
    if (this._segments.length === 0) return 0
    const startDate = parseIsoDate(this._dateRange.start)
    const endDate = parseIsoDate(this._dateRange.end)
    const windowStartMs = startDate.getTime()
    const windowEndExclusiveMs = endDate.getTime() + DAY_MS

    const intervals: SegmentInterval[] = []
    for (
      let cursor = new Date(startDate.getTime() - DAY_MS);
      cursor.getTime() <= endDate.getTime();
      cursor = new Date(cursor.getTime() + DAY_MS)
    ) {
      for (const segment of this._segments) {
        const expanded = segment.expandIntervals(cursor)
        for (const interval of expanded) {
          const clippedStart = Math.max(interval.startMs, windowStartMs)
          const clippedEnd = Math.min(interval.endMs, windowEndExclusiveMs)
          if (clippedStart < clippedEnd) {
            intervals.push({ startMs: clippedStart, endMs: clippedEnd })
          }
        }
      }
    }

    if (intervals.length === 0) return 0
    intervals.sort((a, b) => a.startMs - b.startMs)

    const merged: SegmentInterval[] = [intervals[0]]
    for (let i = 1; i < intervals.length; i += 1) {
      const current = intervals[i]
      const last = merged[merged.length - 1]
      if (current.startMs <= last.endMs) {
        merged[merged.length - 1] = {
          startMs: last.startMs,
          endMs: Math.max(last.endMs, current.endMs),
        }
      } else {
        merged.push(current)
      }
    }

    return merged.reduce(
      (total, interval) => total + (interval.endMs - interval.startMs) / MINUTE_MS,
      0,
    )
  }

  calcularHorasValidas() {
    return this.calcularMinutosValidos() / 60
  }

  toPrimitives(): DisponibilidadPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      startDate: this._dateRange.start,
      endDate: this._dateRange.end,
      segments: this._segments.map((segment) => segment.toPrimitives()),
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get startDate() {
    return this._dateRange.start
  }

  get endDate() {
    return this._dateRange.end
  }

  get createdAt() {
    return this._createdAt
  }

  get segments() {
    return this._segments.map((segment) => segment.toPrimitives())
  }
}
