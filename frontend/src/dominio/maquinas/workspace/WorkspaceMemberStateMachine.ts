import { canTransition, transition, type TransitionMap } from '../core'

export const WORKSPACE_MEMBER_STATES = ['ACTIVE', 'REMOVED'] as const
export type WorkspaceMemberState = (typeof WORKSPACE_MEMBER_STATES)[number]

export const WORKSPACE_MEMBER_EVENTS = ['REMOVE', 'REACTIVATE'] as const
export type WorkspaceMemberEventType = (typeof WORKSPACE_MEMBER_EVENTS)[number]

export const WORKSPACE_MEMBER_TRANSITIONS: TransitionMap<
  WorkspaceMemberState,
  WorkspaceMemberEventType
> = {
  ACTIVE: {
    REMOVE: 'REMOVED',
  },
  REMOVED: {
    REACTIVATE: 'ACTIVE',
  },
}

export const memberStateFromActiveFlag = (active: boolean): WorkspaceMemberState =>
  active ? 'ACTIVE' : 'REMOVED'

export const memberActiveFlagFromState = (state: WorkspaceMemberState): boolean =>
  state === 'ACTIVE'

export const transitionWorkspaceMember = (
  currentState: WorkspaceMemberState,
  eventType: WorkspaceMemberEventType,
) => transition(currentState, eventType, WORKSPACE_MEMBER_TRANSITIONS)

export const canWorkspaceMemberTransition = (
  currentState: WorkspaceMemberState,
  eventType: WorkspaceMemberEventType,
) => canTransition(currentState, eventType, WORKSPACE_MEMBER_TRANSITIONS)
