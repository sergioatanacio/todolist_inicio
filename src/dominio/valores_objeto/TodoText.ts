export class TodoText {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 1) {
      throw new Error('La tarea no puede estar vacia')
    }
    if (normalized.length > 160) {
      throw new Error('La tarea excede 160 caracteres')
    }
    return new TodoText(normalized)
  }

  get value() {
    return this._value
  }
}
