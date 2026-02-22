import { domainError } from '../errores/DomainError'
import { type TaskDomainEvent, taskEvents } from '../eventos/TaskEvents'
import {
  allowedTaskNextStates,
  canTaskTransition,
  eventForTargetState,
  transitionTask,
} from '../maquinas/task/TaskStateMachine'
import { TaskDuration } from '../valores_objeto/TaskDuration'
import { type TaskStatus, isTaskStatus } from '../valores_objeto/TaskStatus'
import { TodoText } from '../valores_objeto/TodoText'

const DEFAULT_TASK_DURATION_MINUTES = 30

type TaskStatusChangePrimitives = {
  fromStatus: TaskStatus
  toStatus: TaskStatus
  changedByUserId: number
  changedAt: number
}

type TaskCommentPrimitives = {
  id: string
  authorUserId: number
  body: string
  parentCommentId: string | null
  createdAt: number
  updatedAt: number | null
  deletedAt: number | null
}

type TaskPrimitives = {
  id: string
  projectId: string
  todoListId: string
  title: string
  durationMinutes: number
  status: TaskStatus
  assigneeUserId: number | null
  createdByUserId: number
  lastStatusChangedByUserId: number
  scheduledStart: number | null
  scheduledEnd: number | null
  comments: TaskCommentPrimitives[]
  statusHistory: TaskStatusChangePrimitives[]
  domainEvents?: TaskDomainEvent[]
  createdAt: number
}

const normalizeCommentBody = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El comentario no puede estar vacio')
  }
  if (normalized.length > 3000) {
    throw domainError(
      'VALIDATION_ERROR',
      'El comentario excede el limite permitido',
    )
  }
  return normalized
}

export class TaskAggregate {
  private readonly _id: string
  private readonly _projectId: string
  private readonly _todoListId: string
  private readonly _title: TodoText
  private readonly _duration: TaskDuration
  private readonly _status: TaskStatus
  private readonly _assigneeUserId: number | null
  private readonly _createdByUserId: number
  private readonly _lastStatusChangedByUserId: number
  private readonly _scheduledStart: number | null
  private readonly _scheduledEnd: number | null
  private readonly _comments: readonly TaskCommentPrimitives[]
  private readonly _statusHistory: readonly TaskStatusChangePrimitives[]
  private readonly _domainEvents: readonly TaskDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    projectId: string
    todoListId: string
    title: TodoText
    duration: TaskDuration
    status: TaskStatus
    assigneeUserId: number | null
    createdByUserId: number
    lastStatusChangedByUserId: number
    scheduledStart: number | null
    scheduledEnd: number | null
    comments: readonly TaskCommentPrimitives[]
    statusHistory: readonly TaskStatusChangePrimitives[]
    domainEvents: readonly TaskDomainEvent[]
    createdAt: number
  }) {
    this._id = data.id
    this._projectId = data.projectId
    this._todoListId = data.todoListId
    this._title = data.title
    this._duration = data.duration
    this._status = data.status
    this._assigneeUserId = data.assigneeUserId
    this._createdByUserId = data.createdByUserId
    this._lastStatusChangedByUserId = data.lastStatusChangedByUserId
    this._scheduledStart = data.scheduledStart
    this._scheduledEnd = data.scheduledEnd
    this._comments = data.comments
    this._statusHistory = data.statusHistory
    this._domainEvents = data.domainEvents
    this._createdAt = data.createdAt
  }

  static create(data: {
    projectId: string
    todoListId: string
    title: string
    createdByUserId: number
    durationMinutes?: number
  }) {
    const durationMinutes =
      data.durationMinutes ?? DEFAULT_TASK_DURATION_MINUTES
    const createdAt = Date.now()
    const id = crypto.randomUUID()
    return new TaskAggregate({
      id,
      projectId: data.projectId,
      todoListId: data.todoListId,
      title: TodoText.create(data.title),
      duration: TaskDuration.create(durationMinutes),
      status: 'PENDING',
      assigneeUserId: null,
      createdByUserId: data.createdByUserId,
      lastStatusChangedByUserId: data.createdByUserId,
      scheduledStart: null,
      scheduledEnd: null,
      comments: [],
      statusHistory: [],
      domainEvents: [
        taskEvents.created({
          taskId: id,
          projectId: data.projectId,
          todoListId: data.todoListId,
          createdByUserId: data.createdByUserId,
        }),
      ],
      createdAt,
    })
  }

  static rehydrate(data: TaskPrimitives) {
    if (!isTaskStatus(data.status)) {
      throw domainError('VALIDATION_ERROR', 'Estado de tarea invalido')
    }
    for (const change of data.statusHistory) {
      if (!isTaskStatus(change.fromStatus) || !isTaskStatus(change.toStatus)) {
        throw domainError('VALIDATION_ERROR', 'Historial de estados invalido')
      }
      if (change.fromStatus === change.toStatus) {
        throw domainError(
          'VALIDATION_ERROR',
          'Historial de estados contiene una transicion invalida',
        )
      }
      const eventType = eventForTargetState(change.fromStatus, change.toStatus)
      if (
        eventType === undefined ||
        !canTaskTransition(change.fromStatus, eventType)
      ) {
        throw domainError(
          'VALIDATION_ERROR',
          'Historial de estados contiene una transicion no permitida',
        )
      }
    }
    const ids = new Set<string>()
    for (const comment of data.comments) {
      if (ids.has(comment.id)) {
        throw domainError('DUPLICATE', 'Comentario duplicado en tarea')
      }
      ids.add(comment.id)
    }
    for (const comment of data.comments) {
      if (comment.parentCommentId && !ids.has(comment.parentCommentId)) {
        throw domainError(
          'NOT_FOUND',
          'Comentario responde a un padre inexistente',
        )
      }
      normalizeCommentBody(comment.body)
    }
    if (
      data.scheduledStart !== null &&
      data.scheduledEnd !== null &&
      data.scheduledEnd <= data.scheduledStart
    ) {
      throw domainError('VALIDATION_ERROR', 'La programacion de la tarea es invalida')
    }
    return new TaskAggregate({
      id: data.id,
      projectId: data.projectId,
      todoListId: data.todoListId,
      title: TodoText.create(data.title),
      duration: TaskDuration.create(data.durationMinutes),
      status: data.status,
      assigneeUserId: data.assigneeUserId,
      createdByUserId: data.createdByUserId,
      lastStatusChangedByUserId: data.lastStatusChangedByUserId,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      comments: data.comments.map((comment) => ({ ...comment })),
      statusHistory: data.statusHistory.map((change) => ({ ...change })),
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  rename(rawTitle: string) {
    return this.cloneWith({ title: TodoText.create(rawTitle) })
  }

  changeDuration(actorUserId: number, rawDurationMinutes: number) {
    this.ensureActor(actorUserId)
    return this.cloneWith({
      duration: TaskDuration.create(rawDurationMinutes),
    })
  }

  assign(actorUserId: number, assigneeUserId: number) {
    this.ensureActor(actorUserId)
    return this.cloneWith({ assigneeUserId })
  }

  unassign(actorUserId: number) {
    this.ensureActor(actorUserId)
    return this.cloneWith({ assigneeUserId: null })
  }

  changeStatus(actorUserId: number, toStatus: TaskStatus) {
    this.ensureActor(actorUserId)
    if (this._status === toStatus) return this
    const eventType = eventForTargetState(this._status, toStatus)
    if (eventType === undefined) {
      throw domainError('INVALID_TRANSITION', 'Transicion de estado no permitida')
    }
    const nextStatus = transitionTask(this._status, eventType)
    return this.cloneWith({
      status: nextStatus,
      lastStatusChangedByUserId: actorUserId,
      statusHistory: [
        ...this._statusHistory,
        {
          fromStatus: this._status,
          toStatus: nextStatus,
          changedByUserId: actorUserId,
          changedAt: Date.now(),
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        taskEvents.statusChanged({
          taskId: this._id,
          fromStatus: this._status,
          toStatus: nextStatus,
          changedByUserId: actorUserId,
        }),
      ],
    })
  }

  toggleDone(actorUserId: number) {
    if (this._status === 'DONE') {
      return this.changeStatus(actorUserId, 'IN_PROGRESS')
    }
    return this.changeStatus(actorUserId, 'DONE')
  }

  canTransitionTo(nextStatus: TaskStatus) {
    if (this._status === nextStatus) return false
    const eventType = eventForTargetState(this._status, nextStatus)
    if (eventType === undefined) return false
    return canTaskTransition(this._status, eventType)
  }

  allowedNextStatuses() {
    return allowedTaskNextStates(this._status)
  }

  schedule(actorUserId: number, scheduledStart: number, scheduledEnd: number) {
    this.ensureActor(actorUserId)
    if (scheduledEnd <= scheduledStart) {
      throw domainError(
        'VALIDATION_ERROR',
        'El rango de planificacion de la tarea es invalido',
      )
    }
    return this.cloneWith({
      scheduledStart,
      scheduledEnd,
      domainEvents: [
        ...this._domainEvents,
        taskEvents.scheduled({
          taskId: this._id,
          scheduledStart,
          scheduledEnd,
          actorUserId,
        }),
      ],
    })
  }

  clearSchedule(actorUserId: number) {
    this.ensureActor(actorUserId)
    return this.cloneWith({
      scheduledStart: null,
      scheduledEnd: null,
    })
  }

  addComment(actorUserId: number, rawBody: string, parentCommentId?: string) {
    this.ensureActor(actorUserId)
    const body = normalizeCommentBody(rawBody)
    if (parentCommentId) {
      const parent = this._comments.find((comment) => comment.id === parentCommentId)
      if (!parent) {
        throw domainError('NOT_FOUND', 'No existe el comentario padre')
      }
      if (parent.deletedAt !== null) {
        throw domainError(
          'INVALID_STATE',
          'No se puede responder a un comentario eliminado',
        )
      }
    }
    const commentId = crypto.randomUUID()
    return this.cloneWith({
      comments: [
        ...this._comments,
        {
          id: commentId,
          authorUserId: actorUserId,
          body,
          parentCommentId: parentCommentId ?? null,
          createdAt: Date.now(),
          updatedAt: null,
          deletedAt: null,
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        taskEvents.commentAdded({
          taskId: this._id,
          commentId,
          authorUserId: actorUserId,
          parentCommentId: parentCommentId ?? null,
        }),
      ],
    })
  }

  editComment(actorUserId: number, commentId: string, rawBody: string) {
    this.ensureActor(actorUserId)
    const body = normalizeCommentBody(rawBody)
    const current = this._comments.find((comment) => comment.id === commentId)
    if (!current) throw domainError('NOT_FOUND', 'Comentario no encontrado')
    if (current.deletedAt !== null) {
      throw domainError(
        'INVALID_STATE',
        'No se puede editar un comentario eliminado',
      )
    }
    if (current.authorUserId !== actorUserId) {
      throw domainError('FORBIDDEN', 'Solo el autor puede editar el comentario')
    }
    return this.cloneWith({
      comments: this._comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, body, updatedAt: Date.now() }
          : comment,
      ),
      domainEvents: [
        ...this._domainEvents,
        taskEvents.commentEdited({
          taskId: this._id,
          commentId,
          actorUserId,
        }),
      ],
    })
  }

  deleteComment(actorUserId: number, commentId: string, force = false) {
    this.ensureActor(actorUserId)
    const current = this._comments.find((comment) => comment.id === commentId)
    if (!current) throw domainError('NOT_FOUND', 'Comentario no encontrado')
    if (current.deletedAt !== null) return this
    if (!force && current.authorUserId !== actorUserId) {
      throw domainError('FORBIDDEN', 'Solo el autor puede eliminar el comentario')
    }
    return this.cloneWith({
      comments: this._comments.map((comment) =>
        comment.id === commentId ? { ...comment, deletedAt: Date.now() } : comment,
      ),
      domainEvents: [
        ...this._domainEvents,
        taskEvents.commentDeleted({
          taskId: this._id,
          commentId,
          actorUserId,
          force,
        }),
      ],
    })
  }

  toPrimitives(): TaskPrimitives {
    return {
      id: this._id,
      projectId: this._projectId,
      todoListId: this._todoListId,
      title: this._title.value,
      durationMinutes: this._duration.value,
      status: this._status,
      assigneeUserId: this._assigneeUserId,
      createdByUserId: this._createdByUserId,
      lastStatusChangedByUserId: this._lastStatusChangedByUserId,
      scheduledStart: this._scheduledStart,
      scheduledEnd: this._scheduledEnd,
      comments: this._comments.map((comment) => ({ ...comment })),
      statusHistory: this._statusHistory.map((change) => ({ ...change })),
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  private cloneWith(
    patch: Partial<{
      title: TodoText
      duration: TaskDuration
      status: TaskStatus
      assigneeUserId: number | null
      lastStatusChangedByUserId: number
      scheduledStart: number | null
      scheduledEnd: number | null
      comments: readonly TaskCommentPrimitives[]
      statusHistory: readonly TaskStatusChangePrimitives[]
      domainEvents: readonly TaskDomainEvent[]
    }>,
  ) {
    const has = <K extends string>(key: K) =>
      Object.prototype.hasOwnProperty.call(patch, key)
    return new TaskAggregate({
      id: this._id,
      projectId: this._projectId,
      todoListId: this._todoListId,
      title: patch.title ?? this._title,
      duration: patch.duration ?? this._duration,
      status: patch.status ?? this._status,
      assigneeUserId: has('assigneeUserId')
        ? (patch.assigneeUserId ?? null)
        : this._assigneeUserId,
      createdByUserId: this._createdByUserId,
      lastStatusChangedByUserId:
        patch.lastStatusChangedByUserId ?? this._lastStatusChangedByUserId,
      scheduledStart: has('scheduledStart')
        ? (patch.scheduledStart ?? null)
        : this._scheduledStart,
      scheduledEnd: has('scheduledEnd')
        ? (patch.scheduledEnd ?? null)
        : this._scheduledEnd,
      comments: patch.comments ?? this._comments,
      statusHistory: patch.statusHistory ?? this._statusHistory,
      domainEvents: patch.domainEvents ?? this._domainEvents,
      createdAt: this._createdAt,
    })
  }

  private ensureActor(actorUserId: number) {
    if (!Number.isInteger(actorUserId) || actorUserId <= 0) {
      throw domainError('UNAUTHORIZED', 'Actor invalido')
    }
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  get id() {
    return this._id
  }

  get projectId() {
    return this._projectId
  }

  get todoListId() {
    return this._todoListId
  }

  get title() {
    return this._title.value
  }

  get durationMinutes() {
    return this._duration.value
  }

  get status() {
    return this._status
  }

  get assigneeUserId() {
    return this._assigneeUserId
  }

  get comments() {
    return this._comments.map((comment) => ({ ...comment }))
  }

  get statusHistory() {
    return this._statusHistory.map((change) => ({ ...change }))
  }

  get createdAt() {
    return this._createdAt
  }
}
