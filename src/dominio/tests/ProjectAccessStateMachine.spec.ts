import { DomainError } from '../errores/DomainError.ts'
import {
  canProjectAccessTransition,
  projectAccessStateFromHasAccess,
  PROJECT_ACCESS_EVENTS,
  PROJECT_ACCESS_STATES,
  PROJECT_ACCESS_TRANSITIONS,
  transitionProjectAccess,
} from '../maquinas/project/ProjectAccessStateMachine.ts'

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

export const projectAccessStateMachineSpec = () => {
  for (const state of PROJECT_ACCESS_STATES) {
    for (const eventType of PROJECT_ACCESS_EVENTS) {
      const expected = PROJECT_ACCESS_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canProjectAccessTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionProjectAccess(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canProjectAccessTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionProjectAccess('NO_ACCESS', 'CHANGE_ROLE'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionProjectAccess('NO_ACCESS', 'REVOKE_ACCESS'),
    'INVALID_TRANSITION',
  )

  assert(
    projectAccessStateFromHasAccess(false) === 'NO_ACCESS',
    'false should map to NO_ACCESS',
  )
  assert(
    projectAccessStateFromHasAccess(true) === 'HAS_ACCESS',
    'true should map to HAS_ACCESS',
  )
}
