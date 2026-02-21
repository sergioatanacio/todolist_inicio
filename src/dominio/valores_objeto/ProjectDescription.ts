export class ProjectDescription {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length > 240) {
      throw new Error('Descripcion de proyecto demasiado larga')
    }
    return new ProjectDescription(normalized)
  }

  get value() {
    return this._value
  }
}
