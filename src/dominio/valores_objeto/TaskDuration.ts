export class TaskDuration {
  private static readonly MAX_MINUTES = 7 * 24 * 60
  private readonly _minutes: number

  private constructor(minutes: number) {
    this._minutes = minutes
  }

  static create(rawMinutes: number) {
    if (!Number.isInteger(rawMinutes) || !Number.isFinite(rawMinutes)) {
      throw new Error('La duracion de la tarea debe ser un entero')
    }
    if (rawMinutes <= 0) {
      throw new Error('La duracion de la tarea debe ser mayor a cero')
    }
    if (rawMinutes > TaskDuration.MAX_MINUTES) {
      throw new Error('La duracion de la tarea excede el limite permitido')
    }
    return new TaskDuration(rawMinutes)
  }

  get value() {
    return this._minutes
  }
}
