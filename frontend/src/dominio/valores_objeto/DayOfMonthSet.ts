const isDayOfMonth = (value: number) =>
  Number.isInteger(value) && value >= 1 && value <= 31

export class DayOfMonthSet {
  private readonly _values: ReadonlySet<number>

  private constructor(values: ReadonlySet<number>) {
    this._values = values
  }

  static create(rawValues: number[]) {
    const next = new Set<number>()
    for (const value of rawValues) {
      if (!isDayOfMonth(value)) {
        throw new Error('Dia del mes invalido. Use valores de 1 a 31')
      }
      next.add(value)
    }
    return new DayOfMonthSet(next)
  }

  has(day: number) {
    if (!isDayOfMonth(day)) return false
    return this._values.has(day)
  }

  toArray() {
    return [...this._values].sort((a, b) => a - b)
  }
}
