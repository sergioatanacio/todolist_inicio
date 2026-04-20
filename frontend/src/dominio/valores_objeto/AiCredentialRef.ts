import { domainError } from '../errores/DomainError'

export class AiCredentialRef {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 8) {
      throw domainError('VALIDATION_ERROR', 'Referencia de credencial IA invalida')
    }
    if (normalized.length > 200) {
      throw domainError('VALIDATION_ERROR', 'Referencia de credencial IA demasiado larga')
    }
    return new AiCredentialRef(normalized)
  }

  get value() {
    return this._value
  }
}
