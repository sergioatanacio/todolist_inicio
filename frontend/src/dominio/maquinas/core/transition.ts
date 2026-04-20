import { domainError } from '../../errores/DomainError'
import type { EventType, StateValue, TransitionMap } from './types'

export const FSM_ERROR_CODE = 'INVALID_TRANSITION' as const

export const buildInvalidTransitionMessage = <
  S extends StateValue,
  E extends EventType,
>(
  currentState: S,
  eventType: E,
) =>
  `Transicion invalida para maquina de estados: state=${currentState}, event=${eventType}`

export const canTransition = <S extends StateValue, E extends EventType>(
  currentState: S,
  eventType: E,
  map: TransitionMap<S, E>,
) => map[currentState]?.[eventType] !== undefined

export const transition = <S extends StateValue, E extends EventType>(
  currentState: S,
  eventType: E,
  map: TransitionMap<S, E>,
) => {
  const nextState = map[currentState]?.[eventType]
  if (nextState === undefined) {
    throw domainError(
      FSM_ERROR_CODE,
      buildInvalidTransitionMessage(currentState, eventType),
      { currentState, eventType },
    )
  }
  return nextState
}
