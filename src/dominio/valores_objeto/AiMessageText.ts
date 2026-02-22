import { domainError } from '../errores/DomainError'

export class AiMessageText {
  private readonly _value: string

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string) {
    const normalized = raw.trim()
    if (normalized.length < 1) {
      throw domainError('VALIDATION_ERROR', 'El mensaje IA no puede estar vacio')
    }
    if (normalized.length > 8000) {
      throw domainError('VALIDATION_ERROR', 'El mensaje IA excede el limite permitido')
    }
    return new AiMessageText(normalized)
  }

  get value() {
    return this._value
  }
}
