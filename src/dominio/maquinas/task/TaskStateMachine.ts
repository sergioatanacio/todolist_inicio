import type { TransitionMap } from '../core'
import type { TaskStatus } from '../../valores_objeto/TaskStatus'
import { canTransition, transition } from '../core'

export const TASK_STATES = [
  'PENDING',
  'IN_PROGRESS',
  'DONE',
  'ABANDONED',
] as const

export type TaskState = (typeof TASK_STATES)[number]

export const TASK_EVENTS = [
  'START',
  'PAUSE',
  'COMPLETE',
  'ABANDON',
] as const

export type TaskEventType = (typeof TASK_EVENTS)[number]

// Matriz declarativa cerrada de estado-evento para el ciclo de vida de Task.
export const TASK_TRANSITIONS: TransitionMap<TaskState, TaskEventType> = {
  PENDING: {
    START: 'IN_PROGRESS',
    COMPLETE: 'DONE',
    ABANDON: 'ABANDONED',
  },
  IN_PROGRESS: {
    PAUSE: 'PENDING',
    COMPLETE: 'DONE',
    ABANDON: 'ABANDONED',
  },
  DONE: {
    START: 'IN_PROGRESS',
    ABANDON: 'ABANDONED',
  },
  ABANDONED: {
    START: 'IN_PROGRESS',
    PAUSE: 'PENDING',
  },
}

// Alias para mantener compatibilidad durante la migracion gradual.
export const TASK_STATE_TRANSITIONS = TASK_TRANSITIONS

// Tabla inversa para mantener compatibilidad con API imperativa changeStatus(toStatus).
export const TASK_EVENT_BY_TARGET_STATUS: Record<
  TaskState,
  Partial<Record<TaskStatus, TaskEventType>>
> = {
  PENDING: {
    IN_PROGRESS: 'START',
    DONE: 'COMPLETE',
    ABANDONED: 'ABANDON',
  },
  IN_PROGRESS: {
    PENDING: 'PAUSE',
    DONE: 'COMPLETE',
    ABANDONED: 'ABANDON',
  },
  DONE: {
    IN_PROGRESS: 'START',
    ABANDONED: 'ABANDON',
  },
  ABANDONED: {
    IN_PROGRESS: 'START',
    PENDING: 'PAUSE',
  },
}

export const transitionTask = (state: TaskState, eventType: TaskEventType) =>
  transition(state, eventType, TASK_TRANSITIONS)

export const canTaskTransition = (state: TaskState, eventType: TaskEventType) =>
  canTransition(state, eventType, TASK_TRANSITIONS)

export const eventForTargetState = (
  currentState: TaskState,
  targetStatus: TaskStatus,
) => TASK_EVENT_BY_TARGET_STATUS[currentState][targetStatus]

export const allowedTaskEvents = (state: TaskState): TaskEventType[] =>
  Object.keys(TASK_TRANSITIONS[state]) as TaskEventType[]

export const allowedTaskNextStates = (state: TaskState): TaskState[] =>
  allowedTaskEvents(state).map((eventType) => TASK_TRANSITIONS[state][eventType]!)
