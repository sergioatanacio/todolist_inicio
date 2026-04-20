export class PersonName {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 2) {
      throw new Error('Nombre demasiado corto')
    }
    return new PersonName(normalized)
  }

  get value() {
    return this._value
  }
}
