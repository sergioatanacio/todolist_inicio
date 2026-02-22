import { canTransition, transition, type TransitionMap } from '../core'

export const AI_CONVERSATION_STATES = ['OPEN', 'CLOSED'] as const
export type AiConversationState = (typeof AI_CONVERSATION_STATES)[number]

export const AI_CONVERSATION_EVENTS = ['CLOSE', 'REOPEN'] as const
export type AiConversationEventType = (typeof AI_CONVERSATION_EVENTS)[number]

export const AI_CONVERSATION_TRANSITIONS: TransitionMap<
  AiConversationState,
  AiConversationEventType
> = {
  OPEN: {
    CLOSE: 'CLOSED',
  },
  CLOSED: {
    REOPEN: 'OPEN',
  },
}

export const transitionAiConversation = (
  currentState: AiConversationState,
  eventType: AiConversationEventType,
) => transition(currentState, eventType, AI_CONVERSATION_TRANSITIONS)

export const canAiConversationTransition = (
  currentState: AiConversationState,
  eventType: AiConversationEventType,
) => canTransition(currentState, eventType, AI_CONVERSATION_TRANSITIONS)
