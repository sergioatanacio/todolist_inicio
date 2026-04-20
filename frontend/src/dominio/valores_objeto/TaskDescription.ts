export class TaskDescription {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 1) {
      throw new Error('La descripcion de la tarea no puede estar vacia')
    }
    if (normalized.length > 500) {
      throw new Error('La descripcion de la tarea excede 500 caracteres')
    }
    return new TaskDescription(normalized)
  }

  get value() {
    return this._value
  }
}
