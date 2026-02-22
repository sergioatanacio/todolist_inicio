import { domainError } from '../errores/DomainError'

export class DisponibilidadName {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 2) {
      throw domainError('VALIDATION_ERROR', 'Nombre de disponibilidad demasiado corto')
    }
    if (normalized.length > 80) {
      throw domainError('VALIDATION_ERROR', 'Nombre de disponibilidad demasiado largo')
    }
    return new DisponibilidadName(normalized)
  }

  get value() {
    return this._value
  }
}
