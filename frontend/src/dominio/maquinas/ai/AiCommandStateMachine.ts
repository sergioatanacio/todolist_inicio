import { canTransition, transition, type TransitionMap } from '../core'

export const AI_COMMAND_STATES = [
  'PROPOSED',
  'APPROVED',
  'REJECTED',
  'EXECUTED',
  'FAILED',
] as const
export type AiCommandState = (typeof AI_COMMAND_STATES)[number]

export const AI_COMMAND_EVENTS = ['APPROVE', 'REJECT', 'EXECUTE', 'FAIL'] as const
export type AiCommandEventType = (typeof AI_COMMAND_EVENTS)[number]

export const AI_COMMAND_TRANSITIONS: TransitionMap<AiCommandState, AiCommandEventType> = {
  PROPOSED: {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    EXECUTE: 'EXECUTED',
    FAIL: 'FAILED',
  },
  APPROVED: {
    EXECUTE: 'EXECUTED',
    FAIL: 'FAILED',
  },
  REJECTED: {},
  EXECUTED: {},
  FAILED: {},
}

export const transitionAiCommand = (
  currentState: AiCommandState,
  eventType: AiCommandEventType,
) => transition(currentState, eventType, AI_COMMAND_TRANSITIONS)

export const canAiCommandTransition = (
  currentState: AiCommandState,
  eventType: AiCommandEventType,
) => canTransition(currentState, eventType, AI_COMMAND_TRANSITIONS)
