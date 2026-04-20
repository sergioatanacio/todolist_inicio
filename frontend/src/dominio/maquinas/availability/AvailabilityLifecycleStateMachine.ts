import { canTransition, transition, type TransitionMap } from '../core'

export const AVAILABILITY_STATES = ['ACTIVE', 'ARCHIVED'] as const
export type AvailabilityState = (typeof AVAILABILITY_STATES)[number]

export const AVAILABILITY_EVENTS = [
  'ARCHIVE',
  'REACTIVATE',
  'CHANGE_DATE_RANGE',
  'ADD_SEGMENT',
  'REMOVE_SEGMENT',
  'REPLACE_SEGMENT',
] as const
export type AvailabilityEventType = (typeof AVAILABILITY_EVENTS)[number]

export const AVAILABILITY_TRANSITIONS: TransitionMap<
  AvailabilityState,
  AvailabilityEventType
> = {
  ACTIVE: {
    ARCHIVE: 'ARCHIVED',
    CHANGE_DATE_RANGE: 'ACTIVE',
    ADD_SEGMENT: 'ACTIVE',
    REMOVE_SEGMENT: 'ACTIVE',
    REPLACE_SEGMENT: 'ACTIVE',
  },
  ARCHIVED: {
    REACTIVATE: 'ACTIVE',
  },
}

export const transitionAvailability = (
  currentState: AvailabilityState,
  eventType: AvailabilityEventType,
) => transition(currentState, eventType, AVAILABILITY_TRANSITIONS)

export const canAvailabilityTransition = (
  currentState: AvailabilityState,
  eventType: AvailabilityEventType,
) => canTransition(currentState, eventType, AVAILABILITY_TRANSITIONS)
