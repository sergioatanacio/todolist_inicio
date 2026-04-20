import { domainError } from '../errores/DomainError'

export class ListOrder {
  private readonly _value: number

  private constructor(value: number) {
    this._value = value
  }

  static create(raw: number) {
    if (!Number.isInteger(raw) || raw <= 0) {
      throw domainError(
        'VALIDATION_ERROR',
        'El orden de lista debe ser un entero positivo',
      )
    }
    return new ListOrder(raw)
  }

  get value() {
    return this._value
  }
}
