import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type WorkspaceCreatedEvent = DomainEvent<{
  ownerUserId: number
  name: string
}> & { type: 'workspace.created' }

export type WorkspaceMemberAddedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  targetUserId: number
}> & { type: 'workspace.member_added' }

export type WorkspaceMemberRemovedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  targetUserId: number
}> & { type: 'workspace.member_removed' }

export type WorkspaceMemberReactivatedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  targetUserId: number
}> & { type: 'workspace.member_reactivated' }

export type WorkspaceRoleCreatedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  roleId: string
}> & { type: 'workspace.role_created' }

export type WorkspaceRoleUpdatedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  roleId: string
}> & { type: 'workspace.role_updated' }

export type WorkspaceRoleDeletedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  roleId: string
}> & { type: 'workspace.role_deleted' }

export type WorkspaceRoleAssignedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  targetUserId: number
  roleId: string
}> & { type: 'workspace.role_assigned' }

export type WorkspaceRoleRevokedEvent = DomainEvent<{
  workspaceId: string
  actorUserId: number
  targetUserId: number
  roleId: string
}> & { type: 'workspace.role_revoked' }

export type WorkspaceOwnershipTransferredEvent = DomainEvent<{
  workspaceId: string
  previousOwnerUserId: number
  nextOwnerUserId: number
}> & { type: 'workspace.ownership_transferred' }

export type WorkspaceDomainEvent =
  | WorkspaceCreatedEvent
  | WorkspaceMemberAddedEvent
  | WorkspaceMemberRemovedEvent
  | WorkspaceMemberReactivatedEvent
  | WorkspaceRoleCreatedEvent
  | WorkspaceRoleUpdatedEvent
  | WorkspaceRoleDeletedEvent
  | WorkspaceRoleAssignedEvent
  | WorkspaceRoleRevokedEvent
  | WorkspaceOwnershipTransferredEvent

export const workspaceEvents = {
  created: (payload: WorkspaceCreatedEvent['payload']): WorkspaceCreatedEvent =>
    createDomainEvent('workspace.created', payload) as WorkspaceCreatedEvent,
  memberAdded: (
    payload: WorkspaceMemberAddedEvent['payload'],
  ): WorkspaceMemberAddedEvent =>
    createDomainEvent(
      'workspace.member_added',
      payload,
    ) as WorkspaceMemberAddedEvent,
  memberRemoved: (
    payload: WorkspaceMemberRemovedEvent['payload'],
  ): WorkspaceMemberRemovedEvent =>
    createDomainEvent(
      'workspace.member_removed',
      payload,
    ) as WorkspaceMemberRemovedEvent,
  memberReactivated: (
    payload: WorkspaceMemberReactivatedEvent['payload'],
  ): WorkspaceMemberReactivatedEvent =>
    createDomainEvent(
      'workspace.member_reactivated',
      payload,
    ) as WorkspaceMemberReactivatedEvent,
  roleCreated: (
    payload: WorkspaceRoleCreatedEvent['payload'],
  ): WorkspaceRoleCreatedEvent =>
    createDomainEvent(
      'workspace.role_created',
      payload,
    ) as WorkspaceRoleCreatedEvent,
  roleUpdated: (
    payload: WorkspaceRoleUpdatedEvent['payload'],
  ): WorkspaceRoleUpdatedEvent =>
    createDomainEvent(
      'workspace.role_updated',
      payload,
    ) as WorkspaceRoleUpdatedEvent,
  roleDeleted: (
    payload: WorkspaceRoleDeletedEvent['payload'],
  ): WorkspaceRoleDeletedEvent =>
    createDomainEvent(
      'workspace.role_deleted',
      payload,
    ) as WorkspaceRoleDeletedEvent,
  roleAssigned: (
    payload: WorkspaceRoleAssignedEvent['payload'],
  ): WorkspaceRoleAssignedEvent =>
    createDomainEvent(
      'workspace.role_assigned',
      payload,
    ) as WorkspaceRoleAssignedEvent,
  roleRevoked: (
    payload: WorkspaceRoleRevokedEvent['payload'],
  ): WorkspaceRoleRevokedEvent =>
    createDomainEvent(
      'workspace.role_revoked',
      payload,
    ) as WorkspaceRoleRevokedEvent,
  ownershipTransferred: (
    payload: WorkspaceOwnershipTransferredEvent['payload'],
  ): WorkspaceOwnershipTransferredEvent =>
    createDomainEvent(
      'workspace.ownership_transferred',
      payload,
    ) as WorkspaceOwnershipTransferredEvent,
}
