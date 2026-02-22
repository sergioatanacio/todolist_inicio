export class TodoDuration {
  private readonly _minutes: number

  private constructor(minutes: number) {
    this._minutes = minutes
  }

  static create(rawMinutes: number) {
    if (!Number.isFinite(rawMinutes) || !Number.isInteger(rawMinutes)) {
      throw new Error('La duracion debe ser un entero')
    }
    if (rawMinutes <= 0) {
      throw new Error('La duracion debe ser mayor a cero')
    }
    if (rawMinutes > 1440) {
      throw new Error('La duracion excede el maximo diario')
    }
    return new TodoDuration(rawMinutes)
  }

  get value() {
    return this._minutes
  }
}
