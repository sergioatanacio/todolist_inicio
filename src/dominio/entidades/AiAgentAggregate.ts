import { domainError } from '../errores/DomainError'
import { type AiAgentDomainEvent, aiAgentEvents } from '../eventos/AiAgentEvents'
import {
  transitionAiAgent,
  type AiAgentState,
} from '../maquinas/ai/AiAgentStateMachine'
import { AiAgentPolicy } from '../valores_objeto/AiAgentPolicy'
import { AiCredentialRef } from '../valores_objeto/AiCredentialRef'
import { type AiProvider, parseAiProvider } from '../valores_objeto/AiProvider'

type AiAgentPrimitives = {
  id: string
  workspaceId: string
  createdByUserId: number
  provider: AiProvider
  model: string
  credentialRef: string | null
  policy: ReturnType<AiAgentPolicy['toPrimitives']>
  state: AiAgentState
  domainEvents?: AiAgentDomainEvent[]
  createdAt: number
}

const normalizeModel = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El modelo IA es obligatorio')
  }
  if (normalized.length > 120) {
    throw domainError('VALIDATION_ERROR', 'El modelo IA es demasiado largo')
  }
  return normalized
}

const normalizeWorkspaceId = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El id del workspace es obligatorio')
  }
  return normalized
}

const ensureActor = (actorUserId: number) => {
  if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
    throw domainError('UNAUTHORIZED', 'Actor invalido')
  }
}

export class AiAgentAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _createdByUserId: number
  private readonly _provider: AiProvider
  private readonly _model: string
  private readonly _credentialRef: string | null
  private readonly _policy: AiAgentPolicy
  private readonly _state: AiAgentState
  private readonly _domainEvents: readonly AiAgentDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    workspaceId: string
    createdByUserId: number
    provider: AiProvider
    model: string
    credentialRef: string | null
    policy: AiAgentPolicy
    state: AiAgentState
    domainEvents: readonly AiAgentDomainEvent[]
    createdAt: number
  }) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._createdByUserId = data.createdByUserId
    this._provider = data.provider
    this._model = data.model
    this._credentialRef = data.credentialRef
    this._policy = data.policy
    this._state = data.state
    this._domainEvents = data.domainEvents
    this._createdAt = data.createdAt
  }

  static create(data: {
    workspaceId: string
    createdByUserId: number
    provider: string
    model: string
    policy?: ReturnType<AiAgentPolicy['toPrimitives']>
  }) {
    ensureActor(data.createdByUserId)
    const id = crypto.randomUUID()
    return new AiAgentAggregate({
      id,
      workspaceId: normalizeWorkspaceId(data.workspaceId),
      createdByUserId: data.createdByUserId,
      provider: parseAiProvider(data.provider),
      model: normalizeModel(data.model),
      credentialRef: null,
      policy: AiAgentPolicy.create(data.policy),
      state: 'ACTIVE',
      domainEvents: [
        aiAgentEvents.created({
          agentId: id,
          workspaceId: normalizeWorkspaceId(data.workspaceId),
          createdByUserId: data.createdByUserId,
        }),
      ],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: AiAgentPrimitives) {
    return new AiAgentAggregate({
      id: data.id,
      workspaceId: normalizeWorkspaceId(data.workspaceId),
      createdByUserId: data.createdByUserId,
      provider: parseAiProvider(data.provider),
      model: normalizeModel(data.model),
      credentialRef: data.credentialRef ? AiCredentialRef.create(data.credentialRef).value : null,
      policy: AiAgentPolicy.create(data.policy),
      state: data.state,
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  attachCredentialRef(actorUserId: number, credentialRef: string) {
    ensureActor(actorUserId)
    if (this._state === 'REVOKED') {
      throw domainError('INVALID_STATE', 'No se puede adjuntar credencial a un agente revocado')
    }
    const nextCredential = AiCredentialRef.create(credentialRef).value
    return this.cloneWith({
      credentialRef: nextCredential,
      domainEvents: [
        ...this._domainEvents,
        aiAgentEvents.credentialAttached({
          agentId: this._id,
          credentialRef: nextCredential,
          actorUserId,
        }),
      ],
    })
  }

  updatePolicy(
    actorUserId: number,
    policy: ReturnType<AiAgentPolicy['toPrimitives']>,
  ) {
    ensureActor(actorUserId)
    if (this._state === 'REVOKED') {
      throw domainError('INVALID_STATE', 'No se puede actualizar politica de un agente revocado')
    }
    return this.cloneWith({
      policy: AiAgentPolicy.create(policy),
      domainEvents: [
        ...this._domainEvents,
        aiAgentEvents.policyUpdated({
          agentId: this._id,
          actorUserId,
        }),
      ],
    })
  }

  pause(actorUserId: number) {
    ensureActor(actorUserId)
    const nextState = transitionAiAgent(this._state, 'PAUSE')
    return this.cloneWith({
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiAgentEvents.stateChanged({
          agentId: this._id,
          actorUserId,
          toState: nextState,
        }),
      ],
    })
  }

  activate(actorUserId: number) {
    ensureActor(actorUserId)
    const nextState = transitionAiAgent(this._state, 'ACTIVATE')
    return this.cloneWith({
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiAgentEvents.stateChanged({
          agentId: this._id,
          actorUserId,
          toState: nextState,
        }),
      ],
    })
  }

  revoke(actorUserId: number) {
    ensureActor(actorUserId)
    const nextState = transitionAiAgent(this._state, 'REVOKE')
    return this.cloneWith({
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiAgentEvents.stateChanged({
          agentId: this._id,
          actorUserId,
          toState: nextState,
        }),
      ],
    })
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): AiAgentPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      createdByUserId: this._createdByUserId,
      provider: this._provider,
      model: this._model,
      credentialRef: this._credentialRef,
      policy: this._policy.toPrimitives(),
      state: this._state,
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  private cloneWith(
    patch: Partial<{
      credentialRef: string | null
      policy: AiAgentPolicy
      state: AiAgentState
      domainEvents: readonly AiAgentDomainEvent[]
    }>,
  ) {
    return new AiAgentAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      createdByUserId: this._createdByUserId,
      provider: this._provider,
      model: this._model,
      credentialRef: patch.credentialRef ?? this._credentialRef,
      policy: patch.policy ?? this._policy,
      state: patch.state ?? this._state,
      domainEvents: patch.domainEvents ?? this._domainEvents,
      createdAt: this._createdAt,
    })
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get createdByUserId() {
    return this._createdByUserId
  }

  get provider() {
    return this._provider
  }

  get model() {
    return this._model
  }

  get credentialRef() {
    return this._credentialRef
  }

  get policy() {
    return this._policy
  }

  get state() {
    return this._state
  }

  get createdAt() {
    return this._createdAt
  }
}
