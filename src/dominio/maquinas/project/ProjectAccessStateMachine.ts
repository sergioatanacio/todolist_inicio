import { canTransition, transition, type TransitionMap } from '../core'

export const PROJECT_ACCESS_STATES = ['NO_ACCESS', 'HAS_ACCESS'] as const
export type ProjectAccessState = (typeof PROJECT_ACCESS_STATES)[number]

export const PROJECT_ACCESS_EVENTS = [
  'GRANT_ACCESS',
  'CHANGE_ROLE',
  'REVOKE_ACCESS',
] as const
export type ProjectAccessEventType = (typeof PROJECT_ACCESS_EVENTS)[number]

export const PROJECT_ACCESS_TRANSITIONS: TransitionMap<
  ProjectAccessState,
  ProjectAccessEventType
> = {
  NO_ACCESS: {
    GRANT_ACCESS: 'HAS_ACCESS',
  },
  HAS_ACCESS: {
    CHANGE_ROLE: 'HAS_ACCESS',
    REVOKE_ACCESS: 'NO_ACCESS',
  },
}

export const projectAccessStateFromHasAccess = (
  hasAccess: boolean,
): ProjectAccessState => (hasAccess ? 'HAS_ACCESS' : 'NO_ACCESS')

export const transitionProjectAccess = (
  currentState: ProjectAccessState,
  eventType: ProjectAccessEventType,
) => transition(currentState, eventType, PROJECT_ACCESS_TRANSITIONS)

export const canProjectAccessTransition = (
  currentState: ProjectAccessState,
  eventType: ProjectAccessEventType,
) => canTransition(currentState, eventType, PROJECT_ACCESS_TRANSITIONS)
