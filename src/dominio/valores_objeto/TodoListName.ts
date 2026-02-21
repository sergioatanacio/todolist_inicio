export class TodoListName {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 2) {
      throw new Error('Nombre de lista demasiado corto')
    }
    if (normalized.length > 60) {
      throw new Error('Nombre de lista demasiado largo')
    }
    return new TodoListName(normalized)
  }

  get value() {
    return this._value
  }
}
