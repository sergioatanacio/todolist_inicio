import { canTransition, transition, type TransitionMap } from '../core'

export const TASK_COMMENT_STATES = ['ACTIVE', 'DELETED'] as const
export type TaskCommentState = (typeof TASK_COMMENT_STATES)[number]

export const TASK_COMMENT_EVENTS = ['EDIT', 'REPLY', 'DELETE'] as const
export type TaskCommentEventType = (typeof TASK_COMMENT_EVENTS)[number]

export const TASK_COMMENT_TRANSITIONS: TransitionMap<
  TaskCommentState,
  TaskCommentEventType
> = {
  ACTIVE: {
    EDIT: 'ACTIVE',
    REPLY: 'ACTIVE',
    DELETE: 'DELETED',
  },
  DELETED: {},
}

export const taskCommentStateFromDeletedAt = (
  deletedAt: number | null,
): TaskCommentState => (deletedAt === null ? 'ACTIVE' : 'DELETED')

export const transitionTaskComment = (
  currentState: TaskCommentState,
  eventType: TaskCommentEventType,
) => transition(currentState, eventType, TASK_COMMENT_TRANSITIONS)

export const canTaskCommentTransition = (
  currentState: TaskCommentState,
  eventType: TaskCommentEventType,
) => canTransition(currentState, eventType, TASK_COMMENT_TRANSITIONS)
