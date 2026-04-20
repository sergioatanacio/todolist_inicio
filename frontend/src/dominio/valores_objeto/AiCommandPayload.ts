import { domainError } from '../errores/DomainError'

export class AiCommandPayload {
  private readonly _value: Record<string, unknown>

  private constructor(value: Record<string, unknown>) {
    this._value = value
  }

  static create(raw: Record<string, unknown>) {
    const serialized = JSON.stringify(raw ?? {})
    if (serialized.length > 20000) {
      throw domainError('VALIDATION_ERROR', 'Payload IA demasiado grande')
    }
    return new AiCommandPayload(raw ?? {})
  }

  get value() {
    return { ...this._value }
  }
}
