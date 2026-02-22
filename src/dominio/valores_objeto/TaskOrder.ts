import { domainError } from '../errores/DomainError'

export class TaskOrder {
  private readonly _value: number

  private constructor(value: number) {
    this._value = value
  }

  static create(raw: number) {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw domainError(
        'VALIDATION_ERROR',
        'El orden de tarea debe ser un entero positivo',
      )
    }
    return new TaskOrder(raw)
  }

  get value() {
    return this._value
  }
}
