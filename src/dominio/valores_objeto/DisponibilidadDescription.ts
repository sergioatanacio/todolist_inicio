import { domainError } from '../errores/DomainError'

export class DisponibilidadDescription {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length > 240) {
      throw domainError(
        'VALIDATION_ERROR',
        'Descripcion de disponibilidad demasiado larga',
      )
    }
    return new DisponibilidadDescription(normalized)
  }

  get value() {
    return this._value
  }
}
