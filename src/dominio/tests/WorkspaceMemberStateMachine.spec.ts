import { DomainError } from '../errores/DomainError.ts'
import {
  canWorkspaceMemberTransition,
  memberActiveFlagFromState,
  memberStateFromActiveFlag,
  transitionWorkspaceMember,
  WORKSPACE_MEMBER_EVENTS,
  WORKSPACE_MEMBER_STATES,
  WORKSPACE_MEMBER_TRANSITIONS,
} from '../maquinas/workspace/WorkspaceMemberStateMachine.ts'

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

export const workspaceMemberStateMachineSpec = () => {
  for (const state of WORKSPACE_MEMBER_STATES) {
    for (const eventType of WORKSPACE_MEMBER_EVENTS) {
      const expected = WORKSPACE_MEMBER_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canWorkspaceMemberTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionWorkspaceMember(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canWorkspaceMemberTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionWorkspaceMember('ACTIVE', 'REACTIVATE'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionWorkspaceMember('REMOVED', 'REMOVE'),
    'INVALID_TRANSITION',
  )

  assert(memberStateFromActiveFlag(true) === 'ACTIVE', 'true must map to ACTIVE')
  assert(
    memberStateFromActiveFlag(false) === 'REMOVED',
    'false must map to REMOVED',
  )
  assert(
    memberActiveFlagFromState('ACTIVE') === true,
    'ACTIVE must map to true',
  )
  assert(
    memberActiveFlagFromState('REMOVED') === false,
    'REMOVED must map to false',
  )
}
