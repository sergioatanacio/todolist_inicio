import { domainError } from '../errores/DomainError'

export class SegmentoTiempoName {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 2) {
      throw domainError('VALIDATION_ERROR', 'Nombre de segmento demasiado corto')
    }
    if (normalized.length > 80) {
      throw domainError('VALIDATION_ERROR', 'Nombre de segmento demasiado largo')
    }
    return new SegmentoTiempoName(normalized)
  }

  get value() {
    return this._value
  }
}
