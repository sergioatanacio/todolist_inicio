import { canTransition, transition, type TransitionMap } from '../core'

export const WORKSPACE_MESSAGE_STATES = ['ACTIVE', 'DELETED'] as const
export type WorkspaceMessageState = (typeof WORKSPACE_MESSAGE_STATES)[number]

export const WORKSPACE_MESSAGE_EVENTS = ['EDIT', 'REPLY', 'DELETE'] as const
export type WorkspaceMessageEventType = (typeof WORKSPACE_MESSAGE_EVENTS)[number]

export const WORKSPACE_MESSAGE_TRANSITIONS: TransitionMap<
  WorkspaceMessageState,
  WorkspaceMessageEventType
> = {
  ACTIVE: {
    EDIT: 'ACTIVE',
    REPLY: 'ACTIVE',
    DELETE: 'DELETED',
  },
  DELETED: {},
}

export const workspaceMessageStateFromDeletedAt = (
  deletedAt: number | null,
): WorkspaceMessageState => (deletedAt === null ? 'ACTIVE' : 'DELETED')

export const transitionWorkspaceMessage = (
  currentState: WorkspaceMessageState,
  eventType: WorkspaceMessageEventType,
) => transition(currentState, eventType, WORKSPACE_MESSAGE_TRANSITIONS)

export const canWorkspaceMessageTransition = (
  currentState: WorkspaceMessageState,
  eventType: WorkspaceMessageEventType,
) => canTransition(currentState, eventType, WORKSPACE_MESSAGE_TRANSITIONS)
