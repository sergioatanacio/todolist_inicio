type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

const isDayOfWeek = (value: number): value is DayOfWeek =>
  Number.isInteger(value) && value >= 1 && value <= 7

export class DayOfWeekSet {
  private readonly _values: ReadonlySet<DayOfWeek>

  private constructor(values: ReadonlySet<DayOfWeek>) {
    this._values = values
  }

  static create(rawValues: number[]) {
    const next = new Set<DayOfWeek>()
    for (const value of rawValues) {
      if (!isDayOfWeek(value)) {
        throw new Error('Dia de semana invalido. Use valores de 1 a 7')
      }
      next.add(value)
    }
    return new DayOfWeekSet(next)
  }

  has(day: number) {
    if (!isDayOfWeek(day)) return false
    return this._values.has(day)
  }

  toArray() {
    return [...this._values].sort((a, b) => a - b)
  }
}
