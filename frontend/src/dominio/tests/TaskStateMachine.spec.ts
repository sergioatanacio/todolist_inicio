import { DomainError } from '../errores/DomainError.ts'
import {
  TASK_EVENTS,
  TASK_STATES,
  TASK_TRANSITIONS,
  allowedTaskEvents,
  allowedTaskNextStates,
  canTaskTransition,
  eventForTargetState,
  transitionTask,
} from '../maquinas/task/TaskStateMachine.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertThrows = (fn: () => void, expectedCode: DomainError['code']) => {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw new Error('Expected DomainError')
    }
    assert(
      error.code === expectedCode,
      `Expected code ${expectedCode} but got ${error.code}`,
    )
  }
}

export const taskStateMachineSpec = () => {
  for (const state of TASK_STATES) {
    for (const eventType of TASK_EVENTS) {
      const expected = TASK_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canTaskTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionTask(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canTaskTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionTask('PENDING', 'PAUSE'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionTask('IN_PROGRESS', 'START'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionTask('DONE', 'PAUSE'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionTask('ABANDONED', 'ABANDON'),
    'INVALID_TRANSITION',
  )

  assert(
    eventForTargetState('IN_PROGRESS', 'DONE') === 'COMPLETE',
    'IN_PROGRESS -> DONE must map to COMPLETE',
  )
  assert(
    eventForTargetState('DONE', 'PENDING') === undefined,
    'DONE -> PENDING should not have mapped event',
  )

  const pendingEvents = allowedTaskEvents('PENDING')
  assert(pendingEvents.length === 3, 'PENDING must expose exactly 3 events')
  const pendingNext = allowedTaskNextStates('PENDING')
  assert(
    pendingNext.includes('IN_PROGRESS') &&
      pendingNext.includes('DONE') &&
      pendingNext.includes('ABANDONED'),
    'PENDING next states mismatch',
  )
}
