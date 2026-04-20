import { canTransition, transition, type TransitionMap } from '../core'

export const AI_USER_CREDENTIAL_STATES = ['ACTIVE', 'REVOKED'] as const
export type AiUserCredentialState = (typeof AI_USER_CREDENTIAL_STATES)[number]

export const AI_USER_CREDENTIAL_EVENTS = ['ROTATE', 'REVOKE'] as const
export type AiUserCredentialEventType = (typeof AI_USER_CREDENTIAL_EVENTS)[number]

export const AI_USER_CREDENTIAL_TRANSITIONS: TransitionMap<
  AiUserCredentialState,
  AiUserCredentialEventType
> = {
  ACTIVE: {
    ROTATE: 'ACTIVE',
    REVOKE: 'REVOKED',
  },
  REVOKED: {},
}

export const transitionAiUserCredential = (
  currentState: AiUserCredentialState,
  eventType: AiUserCredentialEventType,
) => transition(currentState, eventType, AI_USER_CREDENTIAL_TRANSITIONS)

export const canAiUserCredentialTransition = (
  currentState: AiUserCredentialState,
  eventType: AiUserCredentialEventType,
) => canTransition(currentState, eventType, AI_USER_CREDENTIAL_TRANSITIONS)
