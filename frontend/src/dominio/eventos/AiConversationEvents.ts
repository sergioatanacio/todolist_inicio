import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type AiConversationStartedEvent = DomainEvent<{
  conversationId: string
  workspaceId: string
  projectId: string | null
  initiatorUserId: number
  agentId: string
}> & { type: 'ai.conversation.started' }

export type AiConversationMessageAddedEvent = DomainEvent<{
  conversationId: string
  messageId: string
  role: 'USER' | 'AGENT' | 'SYSTEM'
  authorUserId: number | null
}> & { type: 'ai.conversation.message_added' }

export type AiCommandProposedEvent = DomainEvent<{
  conversationId: string
  commandId: string
  intent: string
  requiresApproval: boolean
  proposedByUserId: number
}> & { type: 'ai.command.proposed' }

export type AiCommandStateChangedEvent = DomainEvent<{
  conversationId: string
  commandId: string
  toState: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED'
  actorUserId: number | null
}> & { type: 'ai.command.state_changed' }

export type AiConversationClosedEvent = DomainEvent<{
  conversationId: string
  actorUserId: number
}> & { type: 'ai.conversation.closed' }

export type AiConversationDomainEvent =
  | AiConversationStartedEvent
  | AiConversationMessageAddedEvent
  | AiCommandProposedEvent
  | AiCommandStateChangedEvent
  | AiConversationClosedEvent

export const aiConversationEvents = {
  started: (
    payload: AiConversationStartedEvent['payload'],
  ): AiConversationStartedEvent =>
    createDomainEvent('ai.conversation.started', payload) as AiConversationStartedEvent,
  messageAdded: (
    payload: AiConversationMessageAddedEvent['payload'],
  ): AiConversationMessageAddedEvent =>
    createDomainEvent(
      'ai.conversation.message_added',
      payload,
    ) as AiConversationMessageAddedEvent,
  commandProposed: (
    payload: AiCommandProposedEvent['payload'],
  ): AiCommandProposedEvent =>
    createDomainEvent('ai.command.proposed', payload) as AiCommandProposedEvent,
  commandStateChanged: (
    payload: AiCommandStateChangedEvent['payload'],
  ): AiCommandStateChangedEvent =>
    createDomainEvent(
      'ai.command.state_changed',
      payload,
    ) as AiCommandStateChangedEvent,
  closed: (payload: AiConversationClosedEvent['payload']): AiConversationClosedEvent =>
    createDomainEvent('ai.conversation.closed', payload) as AiConversationClosedEvent,
}
