import { domainError } from '../errores/DomainError'
import {
  type WorkspaceConversationDomainEvent,
  workspaceConversationEvents,
} from '../eventos/WorkspaceConversationEvents'
import {
  transitionWorkspaceMessage,
  workspaceMessageStateFromDeletedAt,
} from '../maquinas/workspace/WorkspaceConversationMessageStateMachine'

type WorkspaceMessagePrimitives = {
  id: string
  authorUserId: number
  body: string
  parentMessageId: string | null
  createdAt: number
  editedAt: number | null
  deletedAt: number | null
}

type WorkspaceConversationPrimitives = {
  id: string
  workspaceId: string
  messages: WorkspaceMessagePrimitives[]
  domainEvents?: WorkspaceConversationDomainEvent[]
  createdAt: number
}

const normalizeBody = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El mensaje no puede estar vacio')
  }
  if (normalized.length > 4000) {
    throw domainError('VALIDATION_ERROR', 'El mensaje excede el limite permitido')
  }
  return normalized
}

export class WorkspaceConversationAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _messages: readonly WorkspaceMessagePrimitives[]
  private readonly _domainEvents: readonly WorkspaceConversationDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: WorkspaceConversationPrimitives) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._messages = data.messages
    this._domainEvents = data.domainEvents ?? []
    this._createdAt = data.createdAt
  }

  static create(workspaceId: string) {
    const normalizedWorkspaceId = workspaceId.trim()
    if (normalizedWorkspaceId.length < 1) {
      throw domainError('VALIDATION_ERROR', 'El id del workspace es obligatorio')
    }
    const id = crypto.randomUUID()
    return new WorkspaceConversationAggregate({
      id,
      workspaceId: normalizedWorkspaceId,
      messages: [],
      domainEvents: [
        workspaceConversationEvents.created({
          conversationId: id,
          workspaceId: normalizedWorkspaceId,
        }),
      ],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: WorkspaceConversationPrimitives) {
    const ids = new Set<string>()
    for (const message of data.messages) {
      if (ids.has(message.id)) {
        throw domainError('DUPLICATE', 'Mensaje duplicado en la conversacion')
      }
      ids.add(message.id)
      normalizeBody(message.body)
    }
    for (const message of data.messages) {
      if (message.parentMessageId && !ids.has(message.parentMessageId)) {
        throw domainError('NOT_FOUND', 'Mensaje responde a un padre inexistente')
      }
      if (message.parentMessageId) {
        const parent = data.messages.find((entry) => entry.id === message.parentMessageId)!
        const parentState = workspaceMessageStateFromDeletedAt(parent.deletedAt)
        try {
          transitionWorkspaceMessage(parentState, 'REPLY')
        } catch {
          throw domainError(
            'INVALID_STATE',
            'Mensaje responde a un padre eliminado',
          )
        }
      }
    }
    return new WorkspaceConversationAggregate({
      id: data.id,
      workspaceId: data.workspaceId.trim(),
      messages: data.messages.map((message) => ({ ...message })),
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  addMessage(actorUserId: number, rawBody: string, parentMessageId?: string) {
    if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
      throw domainError('UNAUTHORIZED', 'Actor invalido')
    }
    if (parentMessageId) {
      const parent = this._messages.find((entry) => entry.id === parentMessageId)
      if (!parent) throw domainError('NOT_FOUND', 'No existe el mensaje padre')
      const parentState = workspaceMessageStateFromDeletedAt(parent.deletedAt)
      try {
        transitionWorkspaceMessage(parentState, 'REPLY')
      } catch {
        throw domainError('INVALID_STATE', 'No se puede responder a un mensaje eliminado')
      }
    }
    const messageId = crypto.randomUUID()
    return new WorkspaceConversationAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      messages: [
        ...this._messages,
        {
          id: messageId,
          authorUserId: actorUserId,
          body: normalizeBody(rawBody),
          parentMessageId: parentMessageId ?? null,
          createdAt: Date.now(),
          editedAt: null,
          deletedAt: null,
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        workspaceConversationEvents.messageAdded({
          conversationId: this._id,
          messageId,
          authorUserId: actorUserId,
          parentMessageId: parentMessageId ?? null,
        }),
      ],
      createdAt: this._createdAt,
    })
  }

  editMessage(actorUserId: number, messageId: string, rawBody: string) {
    const message = this._messages.find((entry) => entry.id === messageId)
    if (!message) throw domainError('NOT_FOUND', 'Mensaje no encontrado')
    if (message.authorUserId !== actorUserId) {
      throw domainError('FORBIDDEN', 'Solo el autor puede editar el mensaje')
    }
    const messageState = workspaceMessageStateFromDeletedAt(message.deletedAt)
    try {
      transitionWorkspaceMessage(messageState, 'EDIT')
    } catch {
      throw domainError('INVALID_STATE', 'No se puede editar un mensaje eliminado')
    }
    return new WorkspaceConversationAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      messages: this._messages.map((entry) =>
        entry.id === messageId
          ? { ...entry, body: normalizeBody(rawBody), editedAt: Date.now() }
          : entry,
      ),
      domainEvents: [
        ...this._domainEvents,
        workspaceConversationEvents.messageEdited({
          conversationId: this._id,
          messageId,
          actorUserId,
        }),
      ],
      createdAt: this._createdAt,
    })
  }

  deleteMessage(actorUserId: number, messageId: string, force = false) {
    const message = this._messages.find((entry) => entry.id === messageId)
    if (!message) throw domainError('NOT_FOUND', 'Mensaje no encontrado')
    if (!force && message.authorUserId !== actorUserId) {
      throw domainError('FORBIDDEN', 'Solo el autor puede eliminar el mensaje')
    }
    const messageState = workspaceMessageStateFromDeletedAt(message.deletedAt)
    try {
      transitionWorkspaceMessage(messageState, 'DELETE')
    } catch {
      return this
    }
    return new WorkspaceConversationAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      messages: this._messages.map((entry) =>
        entry.id === messageId ? { ...entry, deletedAt: Date.now() } : entry,
      ),
      domainEvents: [
        ...this._domainEvents,
        workspaceConversationEvents.messageDeleted({
          conversationId: this._id,
          messageId,
          actorUserId,
          force,
        }),
      ],
      createdAt: this._createdAt,
    })
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): WorkspaceConversationPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      messages: this._messages.map((message) => ({ ...message })),
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get messages() {
    return this._messages.map((message) => ({ ...message }))
  }
}
