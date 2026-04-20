import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type WorkspaceConversationCreatedEvent = DomainEvent<{
  conversationId: string
  workspaceId: string
}> & { type: 'workspace_conversation.created' }

export type WorkspaceMessageAddedEvent = DomainEvent<{
  conversationId: string
  messageId: string
  authorUserId: number
  parentMessageId: string | null
}> & { type: 'workspace_conversation.message_added' }

export type WorkspaceMessageEditedEvent = DomainEvent<{
  conversationId: string
  messageId: string
  actorUserId: number
}> & { type: 'workspace_conversation.message_edited' }

export type WorkspaceMessageDeletedEvent = DomainEvent<{
  conversationId: string
  messageId: string
  actorUserId: number
  force: boolean
}> & { type: 'workspace_conversation.message_deleted' }

export type WorkspaceConversationDomainEvent =
  | WorkspaceConversationCreatedEvent
  | WorkspaceMessageAddedEvent
  | WorkspaceMessageEditedEvent
  | WorkspaceMessageDeletedEvent

export const workspaceConversationEvents = {
  created: (
    payload: WorkspaceConversationCreatedEvent['payload'],
  ): WorkspaceConversationCreatedEvent =>
    createDomainEvent(
      'workspace_conversation.created',
      payload,
    ) as WorkspaceConversationCreatedEvent,
  messageAdded: (
    payload: WorkspaceMessageAddedEvent['payload'],
  ): WorkspaceMessageAddedEvent =>
    createDomainEvent(
      'workspace_conversation.message_added',
      payload,
    ) as WorkspaceMessageAddedEvent,
  messageEdited: (
    payload: WorkspaceMessageEditedEvent['payload'],
  ): WorkspaceMessageEditedEvent =>
    createDomainEvent(
      'workspace_conversation.message_edited',
      payload,
    ) as WorkspaceMessageEditedEvent,
  messageDeleted: (
    payload: WorkspaceMessageDeletedEvent['payload'],
  ): WorkspaceMessageDeletedEvent =>
    createDomainEvent(
      'workspace_conversation.message_deleted',
      payload,
    ) as WorkspaceMessageDeletedEvent,
}
