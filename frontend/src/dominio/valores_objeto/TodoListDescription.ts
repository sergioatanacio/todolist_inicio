export class TodoListDescription {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length > 240) {
      throw new Error('Descripcion de lista demasiado larga')
    }
    return new TodoListDescription(normalized)
  }

  get value() {
    return this._value
  }
}
