import { DomainError } from '../errores/DomainError.ts'
import {
  canTaskCommentTransition,
  taskCommentStateFromDeletedAt,
  TASK_COMMENT_EVENTS,
  TASK_COMMENT_STATES,
  TASK_COMMENT_TRANSITIONS,
  transitionTaskComment,
} from '../maquinas/task/TaskCommentStateMachine.ts'

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

export const taskCommentStateMachineSpec = () => {
  for (const state of TASK_COMMENT_STATES) {
    for (const eventType of TASK_COMMENT_EVENTS) {
      const expected = TASK_COMMENT_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canTaskCommentTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionTaskComment(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canTaskCommentTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionTaskComment('DELETED', 'EDIT'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionTaskComment('DELETED', 'REPLY'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionTaskComment('DELETED', 'DELETE'),
    'INVALID_TRANSITION',
  )

  assert(
    taskCommentStateFromDeletedAt(null) === 'ACTIVE',
    'null deletedAt must map to ACTIVE',
  )
  assert(
    taskCommentStateFromDeletedAt(Date.now()) === 'DELETED',
    'timestamp deletedAt must map to DELETED',
  )
}
