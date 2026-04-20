const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const normalizeDate = (raw: string): string => {
  if (!DATE_RE.test(raw)) {
    throw new Error('La fecha debe tener formato YYYY-MM-DD')
  }
  const date = new Date(`${raw}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha invalida')
  }
  const normalized = date.toISOString().slice(0, 10)
  if (normalized !== raw) {
    throw new Error('Fecha invalida')
  }
  return normalized
}

export class SpecificDateSet {
  private readonly _values: ReadonlySet<string>

  private constructor(values: ReadonlySet<string>) {
    this._values = values
  }

  static create(rawValues: string[]) {
    const next = new Set<string>()
    for (const value of rawValues) {
      next.add(normalizeDate(value))
    }
    return new SpecificDateSet(next)
  }

  has(date: string) {
    try {
      return this._values.has(normalizeDate(date))
    } catch {
      return false
    }
  }

  toArray() {
    return [...this._values].sort()
  }
}
