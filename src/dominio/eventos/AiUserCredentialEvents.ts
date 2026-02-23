import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type AiUserCredentialRegisteredEvent = DomainEvent<{
  credentialId: string
  workspaceId: string
  userId: number
  actorUserId: number
}> & { type: 'ai.user_credential.registered' }

export type AiUserCredentialRotatedEvent = DomainEvent<{
  credentialId: string
  workspaceId: string
  userId: number
  actorUserId: number
}> & { type: 'ai.user_credential.rotated' }

export type AiUserCredentialRevokedEvent = DomainEvent<{
  credentialId: string
  workspaceId: string
  userId: number
  actorUserId: number
}> & { type: 'ai.user_credential.revoked' }

export type AiUserCredentialDomainEvent =
  | AiUserCredentialRegisteredEvent
  | AiUserCredentialRotatedEvent
  | AiUserCredentialRevokedEvent

export const aiUserCredentialEvents = {
  registered: (
    payload: AiUserCredentialRegisteredEvent['payload'],
  ): AiUserCredentialRegisteredEvent =>
    createDomainEvent(
      'ai.user_credential.registered',
      payload,
    ) as AiUserCredentialRegisteredEvent,
  rotated: (
    payload: AiUserCredentialRotatedEvent['payload'],
  ): AiUserCredentialRotatedEvent =>
    createDomainEvent(
      'ai.user_credential.rotated',
      payload,
    ) as AiUserCredentialRotatedEvent,
  revoked: (
    payload: AiUserCredentialRevokedEvent['payload'],
  ): AiUserCredentialRevokedEvent =>
    createDomainEvent(
      'ai.user_credential.revoked',
      payload,
    ) as AiUserCredentialRevokedEvent,
}
