import { domainError } from '../errores/DomainError'
import {
  AI_INTENT_TYPES,
  type AiIntentType,
  isAiIntentType,
  isAiWriteIntent,
} from './AiIntentType'

type AiAgentPolicyPrimitives = {
  allowedIntents: AiIntentType[]
  requireApprovalForWrites: boolean
}

export class AiAgentPolicy {
  private readonly _allowedIntents: readonly AiIntentType[]
  private readonly _requireApprovalForWrites: boolean

  private constructor(data: AiAgentPolicyPrimitives) {
    this._allowedIntents = data.allowedIntents
    this._requireApprovalForWrites = data.requireApprovalForWrites
  }

  static create(data?: Partial<AiAgentPolicyPrimitives>) {
    const allowed = (data?.allowedIntents ?? [...AI_INTENT_TYPES]).filter((intent) =>
      isAiIntentType(intent),
    )
    const unique = [...new Set(allowed)]
    if (unique.length < 1) {
      throw domainError('VALIDATION_ERROR', 'La politica IA requiere intents permitidos')
    }
    return new AiAgentPolicy({
      allowedIntents: unique,
      requireApprovalForWrites: data?.requireApprovalForWrites ?? true,
    })
  }

  allows(intent: AiIntentType) {
    return this._allowedIntents.includes(intent)
  }

  requiresApproval(intent: AiIntentType) {
    if (!this._requireApprovalForWrites) return false
    return isAiWriteIntent(intent)
  }

  toPrimitives(): AiAgentPolicyPrimitives {
    return {
      allowedIntents: [...this._allowedIntents],
      requireApprovalForWrites: this._requireApprovalForWrites,
    }
  }

  get allowedIntents() {
    return [...this._allowedIntents]
  }

  get requireApprovalForWrites() {
    return this._requireApprovalForWrites
  }
}
