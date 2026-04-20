import { canTransition, transition, type TransitionMap } from '../core'

export const AI_AGENT_STATES = ['ACTIVE', 'PAUSED', 'REVOKED'] as const
export type AiAgentState = (typeof AI_AGENT_STATES)[number]

export const AI_AGENT_EVENTS = ['PAUSE', 'ACTIVATE', 'REVOKE'] as const
export type AiAgentEventType = (typeof AI_AGENT_EVENTS)[number]

export const AI_AGENT_TRANSITIONS: TransitionMap<AiAgentState, AiAgentEventType> = {
  ACTIVE: {
    PAUSE: 'PAUSED',
    REVOKE: 'REVOKED',
  },
  PAUSED: {
    ACTIVATE: 'ACTIVE',
    REVOKE: 'REVOKED',
  },
  REVOKED: {},
}

export const transitionAiAgent = (
  currentState: AiAgentState,
  eventType: AiAgentEventType,
) => transition(currentState, eventType, AI_AGENT_TRANSITIONS)

export const canAiAgentTransition = (
  currentState: AiAgentState,
  eventType: AiAgentEventType,
) => canTransition(currentState, eventType, AI_AGENT_TRANSITIONS)
