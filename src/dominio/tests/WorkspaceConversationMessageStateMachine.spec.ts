import { DomainError } from '../errores/DomainError.ts'
import {
  canWorkspaceMessageTransition,
  transitionWorkspaceMessage,
  workspaceMessageStateFromDeletedAt,
  WORKSPACE_MESSAGE_EVENTS,
  WORKSPACE_MESSAGE_STATES,
  WORKSPACE_MESSAGE_TRANSITIONS,
} from '../maquinas/workspace/WorkspaceConversationMessageStateMachine.ts'

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

export const workspaceConversationMessageStateMachineSpec = () => {
  for (const state of WORKSPACE_MESSAGE_STATES) {
    for (const eventType of WORKSPACE_MESSAGE_EVENTS) {
      const expected = WORKSPACE_MESSAGE_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canWorkspaceMessageTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionWorkspaceMessage(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canWorkspaceMessageTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionWorkspaceMessage('DELETED', 'EDIT'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionWorkspaceMessage('DELETED', 'REPLY'),
    'INVALID_TRANSITION',
  )
  assertThrows(
    () => transitionWorkspaceMessage('DELETED', 'DELETE'),
    'INVALID_TRANSITION',
  )

  assert(
    workspaceMessageStateFromDeletedAt(null) === 'ACTIVE',
    'null deletedAt must map to ACTIVE',
  )
  assert(
    workspaceMessageStateFromDeletedAt(Date.now()) === 'DELETED',
    'timestamp deletedAt must map to DELETED',
  )
}
