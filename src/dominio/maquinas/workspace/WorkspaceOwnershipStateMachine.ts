import { transition, type TransitionMap } from '../core'

export const WORKSPACE_OWNERSHIP_STATES = ['OWNED'] as const
export type WorkspaceOwnershipState = (typeof WORKSPACE_OWNERSHIP_STATES)[number]

export const WORKSPACE_OWNERSHIP_EVENTS = ['TRANSFER'] as const
export type WorkspaceOwnershipEventType =
  (typeof WORKSPACE_OWNERSHIP_EVENTS)[number]

export const WORKSPACE_OWNERSHIP_TRANSITIONS: TransitionMap<
  WorkspaceOwnershipState,
  WorkspaceOwnershipEventType
> = {
  OWNED: {
    TRANSFER: 'OWNED',
  },
}

export const transitionWorkspaceOwnership = (
  currentState: WorkspaceOwnershipState,
  eventType: WorkspaceOwnershipEventType,
) => transition(currentState, eventType, WORKSPACE_OWNERSHIP_TRANSITIONS)
