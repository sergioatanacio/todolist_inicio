import { domainError } from '../errores/DomainError'

export class IdempotencyKey {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 8) {
      throw domainError('VALIDATION_ERROR', 'Idempotency key invalido')
    }
    if (normalized.length > 120) {
      throw domainError('VALIDATION_ERROR', 'Idempotency key demasiado largo')
    }
    return new IdempotencyKey(normalized)
  }

  get value() {
    return this._value
  }
}
