import { type DomainEvent, createDomainEvent } from './DomainEvent'
import type { ProjectRoleId } from '../entidades/ProjectAggregate'

export type ProjectCreatedEvent = DomainEvent<{
  projectId: string
  workspaceId: string
  creatorUserId: number
}> & { type: 'project.created' }

export type ProjectAccessGrantedEvent = DomainEvent<{
  projectId: string
  actorUserId: number
  targetUserId: number
  roleId: ProjectRoleId
}> & { type: 'project.access_granted' }

export type ProjectAccessRevokedEvent = DomainEvent<{
  projectId: string
  actorUserId: number
  targetUserId: number
}> & { type: 'project.access_revoked' }

export type ProjectRoleChangedEvent = DomainEvent<{
  projectId: string
  actorUserId: number
  targetUserId: number
  roleId: ProjectRoleId
}> & { type: 'project.role_changed' }

export type ProjectDomainEvent =
  | ProjectCreatedEvent
  | ProjectAccessGrantedEvent
  | ProjectAccessRevokedEvent
  | ProjectRoleChangedEvent

export const projectEvents = {
  created: (payload: ProjectCreatedEvent['payload']): ProjectCreatedEvent =>
    createDomainEvent('project.created', payload) as ProjectCreatedEvent,
  accessGranted: (
    payload: ProjectAccessGrantedEvent['payload'],
  ): ProjectAccessGrantedEvent =>
    createDomainEvent(
      'project.access_granted',
      payload,
    ) as ProjectAccessGrantedEvent,
  accessRevoked: (
    payload: ProjectAccessRevokedEvent['payload'],
  ): ProjectAccessRevokedEvent =>
    createDomainEvent(
      'project.access_revoked',
      payload,
    ) as ProjectAccessRevokedEvent,
  roleChanged: (
    payload: ProjectRoleChangedEvent['payload'],
  ): ProjectRoleChangedEvent =>
    createDomainEvent(
      'project.role_changed',
      payload,
    ) as ProjectRoleChangedEvent,
}
