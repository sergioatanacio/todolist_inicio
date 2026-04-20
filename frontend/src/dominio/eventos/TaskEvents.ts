import { type DomainEvent, createDomainEvent } from './DomainEvent'
import type { TaskStatus } from '../valores_objeto/TaskStatus'

export type TaskCreatedEvent = DomainEvent<{
  taskId: string
  projectId: string
  todoListId: string
  createdByUserId: number
}> & { type: 'task.created' }

export type TaskStatusChangedEvent = DomainEvent<{
  taskId: string
  fromStatus: TaskStatus
  toStatus: TaskStatus
  changedByUserId: number
}> & { type: 'task.status_changed' }

export type TaskScheduledEvent = DomainEvent<{
  taskId: string
  scheduledStart: number
  scheduledEnd: number
  actorUserId: number
}> & { type: 'task.scheduled' }

export type TaskCommentAddedEvent = DomainEvent<{
  taskId: string
  commentId: string
  authorUserId: number
  parentCommentId: string | null
}> & { type: 'task.comment_added' }

export type TaskCommentEditedEvent = DomainEvent<{
  taskId: string
  commentId: string
  actorUserId: number
}> & { type: 'task.comment_edited' }

export type TaskCommentDeletedEvent = DomainEvent<{
  taskId: string
  commentId: string
  actorUserId: number
  force: boolean
}> & { type: 'task.comment_deleted' }

export type TaskDomainEvent =
  | TaskCreatedEvent
  | TaskStatusChangedEvent
  | TaskScheduledEvent
  | TaskCommentAddedEvent
  | TaskCommentEditedEvent
  | TaskCommentDeletedEvent

export const taskEvents = {
  created: (payload: TaskCreatedEvent['payload']): TaskCreatedEvent =>
    createDomainEvent('task.created', payload) as TaskCreatedEvent,
  statusChanged: (
    payload: TaskStatusChangedEvent['payload'],
  ): TaskStatusChangedEvent =>
    createDomainEvent('task.status_changed', payload) as TaskStatusChangedEvent,
  scheduled: (payload: TaskScheduledEvent['payload']): TaskScheduledEvent =>
    createDomainEvent('task.scheduled', payload) as TaskScheduledEvent,
  commentAdded: (
    payload: TaskCommentAddedEvent['payload'],
  ): TaskCommentAddedEvent =>
    createDomainEvent('task.comment_added', payload) as TaskCommentAddedEvent,
  commentEdited: (
    payload: TaskCommentEditedEvent['payload'],
  ): TaskCommentEditedEvent =>
    createDomainEvent('task.comment_edited', payload) as TaskCommentEditedEvent,
  commentDeleted: (
    payload: TaskCommentDeletedEvent['payload'],
  ): TaskCommentDeletedEvent =>
    createDomainEvent('task.comment_deleted', payload) as TaskCommentDeletedEvent,
}
