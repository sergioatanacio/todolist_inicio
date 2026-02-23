import { domainError } from '../errores/DomainError'
import {
  type AiUserCredentialDomainEvent,
  aiUserCredentialEvents,
} from '../eventos/AiUserCredentialEvents'
import {
  transitionAiUserCredential,
  type AiUserCredentialState,
} from '../maquinas/ai/AiUserCredentialStateMachine'
import { AiCredentialRef } from '../valores_objeto/AiCredentialRef'
import { type AiProvider, parseAiProvider } from '../valores_objeto/AiProvider'

type AiUserCredentialPrimitives = {
  id: string
  workspaceId: string
  userId: number
  provider: AiProvider
  credentialRef: string
  state: AiUserCredentialState
  domainEvents?: AiUserCredentialDomainEvent[]
  createdAt: number
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

export class AiUserCredentialAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _userId: number
  private readonly _provider: AiProvider
  private readonly _credentialRef: string
  private readonly _state: AiUserCredentialState
  private readonly _domainEvents: readonly AiUserCredentialDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: AiUserCredentialPrimitives) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._userId = data.userId
    this._provider = data.provider
    this._credentialRef = data.credentialRef
    this._state = data.state
    this._domainEvents = data.domainEvents ?? []
    this._createdAt = data.createdAt
  }

  static register(data: {
    workspaceId: string
    userId: number
    provider: string
    credentialRef: string
    actorUserId: number
  }) {
    ensureActor(data.userId)
    ensureActor(data.actorUserId)
    const id = crypto.randomUUID()
    const workspaceId = normalizeWorkspaceId(data.workspaceId)
    const userId = data.userId
    return new AiUserCredentialAggregate({
      id,
      workspaceId,
      userId,
      provider: parseAiProvider(data.provider),
      credentialRef: AiCredentialRef.create(data.credentialRef).value,
      state: 'ACTIVE',
      domainEvents: [
        aiUserCredentialEvents.registered({
          credentialId: id,
          workspaceId,
          userId,
          actorUserId: data.actorUserId,
        }),
      ],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: AiUserCredentialPrimitives) {
    return new AiUserCredentialAggregate({
      id: data.id,
      workspaceId: normalizeWorkspaceId(data.workspaceId),
      userId: data.userId,
      provider: parseAiProvider(data.provider),
      credentialRef: AiCredentialRef.create(data.credentialRef).value,
      state: data.state,
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  rotate(actorUserId: number, credentialRef: string) {
    ensureActor(actorUserId)
    const nextState = transitionAiUserCredential(this._state, 'ROTATE')
    return this.cloneWith({
      credentialRef: AiCredentialRef.create(credentialRef).value,
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiUserCredentialEvents.rotated({
          credentialId: this._id,
          workspaceId: this._workspaceId,
          userId: this._userId,
          actorUserId,
        }),
      ],
    })
  }

  revoke(actorUserId: number) {
    ensureActor(actorUserId)
    const nextState = transitionAiUserCredential(this._state, 'REVOKE')
    return this.cloneWith({
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiUserCredentialEvents.revoked({
          credentialId: this._id,
          workspaceId: this._workspaceId,
          userId: this._userId,
          actorUserId,
        }),
      ],
    })
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): AiUserCredentialPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      userId: this._userId,
      provider: this._provider,
      credentialRef: this._credentialRef,
      state: this._state,
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  private cloneWith(
    patch: Partial<{
      credentialRef: string
      state: AiUserCredentialState
      domainEvents: readonly AiUserCredentialDomainEvent[]
    }>,
  ) {
    return new AiUserCredentialAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      userId: this._userId,
      provider: this._provider,
      credentialRef: patch.credentialRef ?? this._credentialRef,
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

  get userId() {
    return this._userId
  }

  get provider() {
    return this._provider
  }

  get credentialRef() {
    return this._credentialRef
  }

  get state() {
    return this._state
  }

  get createdAt() {
    return this._createdAt
  }
}
