const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const parseIsoDate = (raw: string): Date => {
  if (!DATE_RE.test(raw)) {
    throw new Error('La fecha debe tener formato YYYY-MM-DD')
  }
  const date = new Date(`${raw}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha invalida')
  }
  const [year, month, day] = raw.split('-').map(Number)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Fecha invalida')
  }
  return date
}

export class DateRange {
  private readonly _start: string
  private readonly _end: string
  private readonly _startDate: Date
  private readonly _endDate: Date

  private constructor(start: string, end: string, startDate: Date, endDate: Date) {
    this._start = start
    this._end = end
    this._startDate = startDate
    this._endDate = endDate
  }

  static create(start: string, end: string) {
    const startDate = parseIsoDate(start)
    const endDate = parseIsoDate(end)
    if (startDate.getTime() > endDate.getTime()) {
      throw new Error('La fecha de inicio no puede ser mayor que la fecha final')
    }
    return new DateRange(start, end, startDate, endDate)
  }

  contains(date: string) {
    const current = parseIsoDate(date).getTime()
    return (
      current >= this._startDate.getTime() && current <= this._endDate.getTime()
    )
  }

  intersects(other: DateRange) {
    return !(
      this._endDate.getTime() < other._startDate.getTime() ||
      other._endDate.getTime() < this._startDate.getTime()
    )
  }

  intersection(other: DateRange): DateRange | null {
    if (!this.intersects(other)) return null
    const startMs = Math.max(
      this._startDate.getTime(),
      other._startDate.getTime(),
    )
    const endMs = Math.min(this._endDate.getTime(), other._endDate.getTime())
    const start = new Date(startMs).toISOString().slice(0, 10)
    const end = new Date(endMs).toISOString().slice(0, 10)
    return DateRange.create(start, end)
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }
}
