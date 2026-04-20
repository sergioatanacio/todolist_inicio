import { DomainError } from '../errores/DomainError.ts'
import {
  AVAILABILITY_EVENTS,
  AVAILABILITY_STATES,
  AVAILABILITY_TRANSITIONS,
  canAvailabilityTransition,
  transitionAvailability,
} from '../maquinas/availability/AvailabilityLifecycleStateMachine.ts'

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

export const availabilityLifecycleStateMachineSpec = () => {
  for (const state of AVAILABILITY_STATES) {
    for (const eventType of AVAILABILITY_EVENTS) {
      const expected = AVAILABILITY_TRANSITIONS[state][eventType]
      if (expected !== undefined) {
        assert(
          canAvailabilityTransition(state, eventType),
          `Expected ${state} + ${eventType} to be allowed`,
        )
        assert(
          transitionAvailability(state, eventType) === expected,
          `Expected ${state} + ${eventType} => ${expected}`,
        )
      } else {
        assert(
          !canAvailabilityTransition(state, eventType),
          `Expected ${state} + ${eventType} to be blocked`,
        )
      }
    }
  }

  assertThrows(
    () => transitionAvailability('ARCHIVED', 'ADD_SEGMENT'),
    'INVALID_TRANSITION',
  )
}
