import { domainError } from '../errores/DomainError'

export class SegmentoTiempoDescription {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length > 240) {
      throw domainError('VALIDATION_ERROR', 'Descripcion de segmento demasiado larga')
    }
    return new SegmentoTiempoDescription(normalized)
  }

  get value() {
    return this._value
  }
}
