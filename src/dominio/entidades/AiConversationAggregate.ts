import { domainError } from '../errores/DomainError'
import {
  type AiConversationDomainEvent,
  aiConversationEvents,
} from '../eventos/AiConversationEvents'
import {
  transitionAiCommand,
  type AiCommandState,
} from '../maquinas/ai/AiCommandStateMachine'
import {
  transitionAiConversation,
  type AiConversationState,
} from '../maquinas/ai/AiConversationStateMachine'
import { AiCommandPayload } from '../valores_objeto/AiCommandPayload'
import { type AiIntentType, isAiWriteIntent, parseAiIntentType } from '../valores_objeto/AiIntentType'
import { IdempotencyKey } from '../valores_objeto/IdempotencyKey'
import { type AiMessageRole, parseAiMessageRole } from '../valores_objeto/AiMessageRole'
import { AiMessageText } from '../valores_objeto/AiMessageText'

type AiConversationMessagePrimitives = {
  id: string
  role: AiMessageRole
  authorUserId: number | null
  body: string
  createdAt: number
}

type AiConversationCommandPrimitives = {
  id: string
  intent: AiIntentType
  payload: Record<string, unknown>
  idempotencyKey: string
  requiresApproval: boolean
  proposedByUserId?: number
  state: AiCommandState
  proposedAt: number
  approvedByUserId: number | null
  approvedAt: number | null
  rejectedByUserId: number | null
  rejectedAt: number | null
  executedByUserId: number | null
  executedAt: number | null
  failedAt: number | null
  failureReason: string | null
}

type AiConversationPrimitives = {
  id: string
  workspaceId: string
  projectId: string | null
  initiatorUserId: number
  agentId: string
  state: AiConversationState
  messages: AiConversationMessagePrimitives[]
  commands: AiConversationCommandPrimitives[]
  domainEvents?: AiConversationDomainEvent[]
  createdAt: number
}

const normalizeWorkspaceId = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El id del workspace es obligatorio')
  }
  return normalized
}

const normalizeOptionalProjectId = (raw?: string | null) => {
  if (!raw) return null
  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : null
}

const normalizeFailureReason = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El motivo de fallo es obligatorio')
  }
  if (normalized.length > 3000) {
    throw domainError('VALIDATION_ERROR', 'El motivo de fallo es demasiado largo')
  }
  return normalized
}

const ensureActor = (actorUserId: number) => {
  if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
    throw domainError('UNAUTHORIZED', 'Actor invalido')
  }
}

const readScopeValue = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key]
  if (value == null) return null
  if (typeof value !== 'string') {
    throw domainError('VALIDATION_ERROR', `Payload invalido: ${key}`)
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export class AiConversationAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _projectId: string | null
  private readonly _initiatorUserId: number
  private readonly _agentId: string
  private readonly _state: AiConversationState
  private readonly _messages: readonly AiConversationMessagePrimitives[]
  private readonly _commands: readonly AiConversationCommandPrimitives[]
  private readonly _domainEvents: readonly AiConversationDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: AiConversationPrimitives) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._projectId = data.projectId
    this._initiatorUserId = data.initiatorUserId
    this._agentId = data.agentId
    this._state = data.state
    this._messages = data.messages
    this._commands = data.commands
    this._domainEvents = data.domainEvents ?? []
    this._createdAt = data.createdAt
  }

  static start(data: {
    workspaceId: string
    projectId?: string | null
    initiatorUserId: number
    agentId: string
  }) {
    ensureActor(data.initiatorUserId)
    const id = crypto.randomUUID()
    const workspaceId = normalizeWorkspaceId(data.workspaceId)
    const projectId = normalizeOptionalProjectId(data.projectId)
    const agentId = data.agentId.trim()
    if (agentId.length < 1) {
      throw domainError('VALIDATION_ERROR', 'El id del agente es obligatorio')
    }
    return new AiConversationAggregate({
      id,
      workspaceId,
      projectId,
      initiatorUserId: data.initiatorUserId,
      agentId,
      state: 'OPEN',
      messages: [],
      commands: [],
      domainEvents: [
        aiConversationEvents.started({
          conversationId: id,
          workspaceId,
          projectId,
          initiatorUserId: data.initiatorUserId,
          agentId,
        }),
      ],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: AiConversationPrimitives) {
    const idempotency = new Set<string>()
    for (const command of data.commands) {
      parseAiIntentType(command.intent)
      AiCommandPayload.create(command.payload)
      ensureActor(command.proposedByUserId ?? data.initiatorUserId)
      const key = IdempotencyKey.create(command.idempotencyKey).value
      if (idempotency.has(key)) {
        throw domainError('DUPLICATE', 'Idempotency key duplicado en conversacion')
      }
      idempotency.add(key)
    }
    for (const message of data.messages) {
      parseAiMessageRole(message.role)
      AiMessageText.create(message.body)
    }
    return new AiConversationAggregate({
      id: data.id,
      workspaceId: normalizeWorkspaceId(data.workspaceId),
      projectId: normalizeOptionalProjectId(data.projectId),
      initiatorUserId: data.initiatorUserId,
      agentId: data.agentId.trim(),
      state: data.state,
      messages: data.messages.map((item) => ({ ...item })),
      commands: data.commands.map((item) => ({
        ...item,
        proposedByUserId: item.proposedByUserId ?? data.initiatorUserId,
      })),
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  addUserMessage(actorUserId: number, body: string) {
    ensureActor(actorUserId)
    this.ensureOpen()
    const messageId = crypto.randomUUID()
    return this.cloneWith({
      messages: [
        ...this._messages,
        {
          id: messageId,
          role: 'USER',
          authorUserId: actorUserId,
          body: AiMessageText.create(body).value,
          createdAt: Date.now(),
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        aiConversationEvents.messageAdded({
          conversationId: this._id,
          messageId,
          role: 'USER',
          authorUserId: actorUserId,
        }),
      ],
    })
  }

  addAgentMessage(body: string) {
    this.ensureOpen()
    const messageId = crypto.randomUUID()
    return this.cloneWith({
      messages: [
        ...this._messages,
        {
          id: messageId,
          role: 'AGENT',
          authorUserId: null,
          body: AiMessageText.create(body).value,
          createdAt: Date.now(),
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        aiConversationEvents.messageAdded({
          conversationId: this._id,
          messageId,
          role: 'AGENT',
          authorUserId: null,
        }),
      ],
    })
  }

  addSystemMessage(body: string) {
    this.ensureOpen()
    const messageId = crypto.randomUUID()
    return this.cloneWith({
      messages: [
        ...this._messages,
        {
          id: messageId,
          role: 'SYSTEM',
          authorUserId: null,
          body: AiMessageText.create(body).value,
          createdAt: Date.now(),
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        aiConversationEvents.messageAdded({
          conversationId: this._id,
          messageId,
          role: 'SYSTEM',
          authorUserId: null,
        }),
      ],
    })
  }

  proposeCommand(data: {
    intent: string
    payload: Record<string, unknown>
    idempotencyKey: string
    proposedByUserId?: number
  }) {
    this.ensureOpen()
    const proposedByUserId = data.proposedByUserId ?? this._initiatorUserId
    ensureActor(proposedByUserId)
    const intent = parseAiIntentType(data.intent)
    const payload = AiCommandPayload.create(data.payload).value
    const payloadWorkspaceId = readScopeValue(payload, 'workspaceId')
    if (payloadWorkspaceId && payloadWorkspaceId !== this._workspaceId) {
      throw domainError('CONFLICT', 'El payload apunta a otro workspace')
    }
    const payloadProjectId = readScopeValue(payload, 'projectId')
    if (payloadProjectId) {
      if (!this._projectId || payloadProjectId !== this._projectId) {
        throw domainError('CONFLICT', 'El payload apunta a otro proyecto')
      }
    }
    const key = IdempotencyKey.create(data.idempotencyKey).value
    if (this._commands.some((command) => command.idempotencyKey === key)) {
      throw domainError('DUPLICATE', 'Comando duplicado por idempotency key')
    }
    const requiresApproval = isAiWriteIntent(intent)
    const commandId = crypto.randomUUID()
    return this.cloneWith({
      commands: [
        ...this._commands,
        {
          id: commandId,
          intent,
          payload,
          idempotencyKey: key,
          requiresApproval,
          proposedByUserId,
          state: 'PROPOSED',
          proposedAt: Date.now(),
          approvedByUserId: null,
          approvedAt: null,
          rejectedByUserId: null,
          rejectedAt: null,
          executedByUserId: null,
          executedAt: null,
          failedAt: null,
          failureReason: null,
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        aiConversationEvents.commandProposed({
          conversationId: this._id,
          commandId,
          intent,
          requiresApproval,
          proposedByUserId,
        }),
      ],
    })
  }

  approveCommand(commandId: string, actorUserId: number) {
    ensureActor(actorUserId)
    this.ensureOpen()
    const command = this.findCommand(commandId)
    if (!command.requiresApproval) {
      throw domainError('INVALID_STATE', 'Este comando no requiere aprobacion')
    }
    const nextState = transitionAiCommand(command.state, 'APPROVE')
    return this.patchCommand(commandId, {
      state: nextState,
      approvedByUserId: actorUserId,
      approvedAt: Date.now(),
      domainEvent: aiConversationEvents.commandStateChanged({
        conversationId: this._id,
        commandId,
        toState: nextState,
        actorUserId,
      }),
    })
  }

  rejectCommand(commandId: string, actorUserId: number) {
    ensureActor(actorUserId)
    this.ensureOpen()
    const command = this.findCommand(commandId)
    const nextState = transitionAiCommand(command.state, 'REJECT')
    return this.patchCommand(commandId, {
      state: nextState,
      rejectedByUserId: actorUserId,
      rejectedAt: Date.now(),
      domainEvent: aiConversationEvents.commandStateChanged({
        conversationId: this._id,
        commandId,
        toState: nextState,
        actorUserId,
      }),
    })
  }

  markExecuted(commandId: string, actorUserId: number) {
    ensureActor(actorUserId)
    this.ensureOpen()
    const command = this.findCommand(commandId)
    if (command.requiresApproval && command.state !== 'APPROVED') {
      throw domainError('INVALID_STATE', 'El comando requiere aprobacion previa')
    }
    const eventType =
      command.state === 'APPROVED' ? 'EXECUTE' : 'EXECUTE'
    const nextState = transitionAiCommand(command.state, eventType)
    return this.patchCommand(commandId, {
      state: nextState,
      executedByUserId: actorUserId,
      executedAt: Date.now(),
      domainEvent: aiConversationEvents.commandStateChanged({
        conversationId: this._id,
        commandId,
        toState: nextState,
        actorUserId,
      }),
    })
  }

  markFailed(commandId: string, reason: string) {
    this.ensureOpen()
    const command = this.findCommand(commandId)
    const nextState = transitionAiCommand(command.state, 'FAIL')
    return this.patchCommand(commandId, {
      state: nextState,
      failedAt: Date.now(),
      failureReason: normalizeFailureReason(reason),
      domainEvent: aiConversationEvents.commandStateChanged({
        conversationId: this._id,
        commandId,
        toState: nextState,
        actorUserId: null,
      }),
    })
  }

  close(actorUserId: number) {
    ensureActor(actorUserId)
    const nextState = transitionAiConversation(this._state, 'CLOSE')
    return this.cloneWith({
      state: nextState,
      domainEvents: [
        ...this._domainEvents,
        aiConversationEvents.closed({
          conversationId: this._id,
          actorUserId,
        }),
      ],
    })
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): AiConversationPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      projectId: this._projectId,
      initiatorUserId: this._initiatorUserId,
      agentId: this._agentId,
      state: this._state,
      messages: this._messages.map((message) => ({ ...message })),
      commands: this._commands.map((command) => ({ ...command, payload: { ...command.payload } })),
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  private patchCommand(
    commandId: string,
    patch: Partial<AiConversationCommandPrimitives> & { domainEvent: AiConversationDomainEvent },
  ) {
    const commands = this._commands.map((command) =>
      command.id === commandId
        ? {
            ...command,
            ...patch,
          }
        : command,
    )
    return this.cloneWith({
      commands,
      domainEvents: [...this._domainEvents, patch.domainEvent],
    })
  }

  private findCommand(commandId: string) {
    const command = this._commands.find((item) => item.id === commandId)
    if (!command) {
      throw domainError('NOT_FOUND', 'Comando IA no encontrado')
    }
    return command
  }

  private ensureOpen() {
    if (this._state !== 'OPEN') {
      throw domainError('INVALID_STATE', 'La conversacion IA esta cerrada')
    }
  }

  private cloneWith(
    patch: Partial<{
      state: AiConversationState
      messages: readonly AiConversationMessagePrimitives[]
      commands: readonly AiConversationCommandPrimitives[]
      domainEvents: readonly AiConversationDomainEvent[]
    }>,
  ) {
    return new AiConversationAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      projectId: this._projectId,
      initiatorUserId: this._initiatorUserId,
      agentId: this._agentId,
      state: patch.state ?? this._state,
      messages: [...(patch.messages ?? this._messages)],
      commands: [...(patch.commands ?? this._commands)],
      domainEvents: [...(patch.domainEvents ?? this._domainEvents)],
      createdAt: this._createdAt,
    })
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get projectId() {
    return this._projectId
  }

  get initiatorUserId() {
    return this._initiatorUserId
  }

  get agentId() {
    return this._agentId
  }

  get state() {
    return this._state
  }

  get messages() {
    return this._messages.map((message) => ({ ...message }))
  }

  get commands() {
    return this._commands.map((command) => ({ ...command, payload: { ...command.payload } }))
  }
}
