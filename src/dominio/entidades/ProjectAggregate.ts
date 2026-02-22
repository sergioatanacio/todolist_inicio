import { domainError } from '../errores/DomainError'
import {
  type ProjectDomainEvent,
  projectEvents,
} from '../eventos/ProjectEvents'
import {
  projectAccessStateFromHasAccess,
  transitionProjectAccess,
} from '../maquinas/project/ProjectAccessStateMachine'
import type { Permission } from '../valores_objeto/Permission'
import { ProjectDescription } from '../valores_objeto/ProjectDescription'
import { ProjectName } from '../valores_objeto/ProjectName'

export const PROJECT_ROLE_IDS = {
  MANAGER: 'manager',
  CONTRIBUTOR: 'contributor',
  TRACKER: 'tracker',
  VIEWER: 'viewer',
} as const

export type ProjectRoleId = (typeof PROJECT_ROLE_IDS)[keyof typeof PROJECT_ROLE_IDS]

type ProjectAccessPrimitives = {
  userId: number
  roleId: ProjectRoleId
  grantedByUserId: number
  grantedAt: number
}

type ProjectPrimitives = {
  id: string
  workspaceId: string
  name: string
  description: string
  access: ProjectAccessPrimitives[]
  domainEvents?: ProjectDomainEvent[]
  createdAt: number
}

const PROJECT_ROLE_PERMISSIONS: Record<ProjectRoleId, Permission[]> = {
  manager: [
    'project.view',
    'project.access.manage',
    'project.todolists.create',
    'project.availability.create',
    'project.todolists.members.assign',
    'task.create',
    'task.update',
    'task.assign',
    'task.status.update',
    'task.status.toggle_done',
    'task.comment.add',
    'task.comment.moderate',
  ],
  contributor: [
    'project.view',
    'project.todolists.create',
    'project.availability.create',
    'task.create',
    'task.update',
    'task.assign',
    'task.status.update',
    'task.status.toggle_done',
    'task.comment.add',
  ],
  tracker: ['project.view', 'task.status.toggle_done', 'task.comment.add'],
  viewer: ['project.view'],
}

const isProjectRoleId = (value: string): value is ProjectRoleId =>
  Object.values(PROJECT_ROLE_IDS).includes(value as ProjectRoleId)

export class ProjectAggregate {
  private readonly _id: string
  private readonly _workspaceId: string
  private readonly _name: ProjectName
  private readonly _description: ProjectDescription
  private readonly _access: readonly ProjectAccessPrimitives[]
  private readonly _domainEvents: readonly ProjectDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: {
    id: string
    workspaceId: string
    name: ProjectName
    description: ProjectDescription
    access: readonly ProjectAccessPrimitives[]
    domainEvents?: readonly ProjectDomainEvent[]
    createdAt: number
  }) {
    this._id = data.id
    this._workspaceId = data.workspaceId
    this._name = data.name
    this._description = data.description
    this._access = data.access
    this._domainEvents = data.domainEvents ?? []
    this._createdAt = data.createdAt
  }

  static create(
    workspaceId: string,
    creatorUserId: number,
    rawName: string,
    rawDescription: string,
  ) {
    const id = crypto.randomUUID()
    return new ProjectAggregate({
      id,
      workspaceId,
      name: ProjectName.create(rawName),
      description: ProjectDescription.create(rawDescription),
      access: [
        {
          userId: creatorUserId,
          roleId: PROJECT_ROLE_IDS.MANAGER,
          grantedByUserId: creatorUserId,
          grantedAt: Date.now(),
        },
      ],
      domainEvents: [
        projectEvents.created({
          projectId: id,
          workspaceId,
          creatorUserId,
        }),
      ],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: ProjectPrimitives) {
    const uniqueByUser = new Set<number>()
    const access = data.access.map((entry) => {
      if (uniqueByUser.has(entry.userId)) {
        throw domainError('DUPLICATE', 'Un usuario no puede tener mas de un acceso por proyecto')
      }
      uniqueByUser.add(entry.userId)
      if (!isProjectRoleId(entry.roleId)) {
        throw domainError('VALIDATION_ERROR', 'Rol de proyecto invalido')
      }
      return entry
    })
    return new ProjectAggregate({
      id: data.id,
      workspaceId: data.workspaceId,
      name: ProjectName.create(data.name),
      description: ProjectDescription.create(data.description),
      access,
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  rename(rawName: string) {
    return new ProjectAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      name: ProjectName.create(rawName),
      description: this._description,
      access: this._access,
      domainEvents: this._domainEvents,
      createdAt: this._createdAt,
    })
  }

  updateDescription(rawDescription: string) {
    return new ProjectAggregate({
      id: this._id,
      workspaceId: this._workspaceId,
      name: this._name,
      description: ProjectDescription.create(rawDescription),
      access: this._access,
      domainEvents: this._domainEvents,
      createdAt: this._createdAt,
    })
  }

  grantAccess(data: {
    actorUserId: number
    targetUserId: number
    roleId: ProjectRoleId
    targetIsWorkspaceMember: boolean
    actorHasWorkspaceOverride?: boolean
  }) {
    const canManage =
      this.hasPermission(data.actorUserId, 'project.access.manage') ||
      data.actorHasWorkspaceOverride === true
    if (!canManage) {
      throw domainError('FORBIDDEN', 'El actor no puede administrar accesos del proyecto')
    }
    if (!data.targetIsWorkspaceMember) {
      throw domainError('FORBIDDEN', 'El usuario objetivo no pertenece al workspace')
    }
    const existing = this._access.find((entry) => entry.userId === data.targetUserId)
    if (existing) {
      transitionProjectAccess(
        projectAccessStateFromHasAccess(true),
        'CHANGE_ROLE',
      )
      return this.changeProjectRole({
        actorUserId: data.actorUserId,
        targetUserId: data.targetUserId,
        roleId: data.roleId,
        actorHasWorkspaceOverride: data.actorHasWorkspaceOverride,
      })
    }
    transitionProjectAccess(projectAccessStateFromHasAccess(false), 'GRANT_ACCESS')
    return ProjectAggregate.rehydrate({
      ...this.toPrimitives(),
      access: [
        ...this._access,
        {
          userId: data.targetUserId,
          roleId: data.roleId,
          grantedByUserId: data.actorUserId,
          grantedAt: Date.now(),
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        projectEvents.accessGranted({
          projectId: this._id,
          actorUserId: data.actorUserId,
          targetUserId: data.targetUserId,
          roleId: data.roleId,
        }),
      ],
    })
  }

  revokeAccess(data: {
    actorUserId: number
    targetUserId: number
    actorHasWorkspaceOverride?: boolean
  }) {
    const canManage =
      this.hasPermission(data.actorUserId, 'project.access.manage') ||
      data.actorHasWorkspaceOverride === true
    if (!canManage) {
      throw domainError('FORBIDDEN', 'El actor no puede administrar accesos del proyecto')
    }
    if (!this._access.some((entry) => entry.userId === data.targetUserId)) {
      return this
    }
    transitionProjectAccess(projectAccessStateFromHasAccess(true), 'REVOKE_ACCESS')
    const nextAccess = this._access.filter((entry) => entry.userId !== data.targetUserId)
    if (nextAccess.length === 0) {
      throw domainError('INVALID_STATE', 'El proyecto no puede quedarse sin miembros')
    }
    return ProjectAggregate.rehydrate({
      ...this.toPrimitives(),
      access: nextAccess,
      domainEvents: [
        ...this._domainEvents,
        projectEvents.accessRevoked({
          projectId: this._id,
          actorUserId: data.actorUserId,
          targetUserId: data.targetUserId,
        }),
      ],
    })
  }

  changeProjectRole(data: {
    actorUserId: number
    targetUserId: number
    roleId: ProjectRoleId
    actorHasWorkspaceOverride?: boolean
  }) {
    const canManage =
      this.hasPermission(data.actorUserId, 'project.access.manage') ||
      data.actorHasWorkspaceOverride === true
    if (!canManage) {
      throw domainError('FORBIDDEN', 'El actor no puede administrar accesos del proyecto')
    }
    if (!this._access.some((entry) => entry.userId === data.targetUserId)) {
      throw domainError('NOT_FOUND', 'El usuario objetivo no tiene acceso al proyecto')
    }
    transitionProjectAccess(projectAccessStateFromHasAccess(true), 'CHANGE_ROLE')
    return ProjectAggregate.rehydrate({
      ...this.toPrimitives(),
      access: this._access.map((entry) =>
        entry.userId === data.targetUserId
          ? {
              ...entry,
              roleId: data.roleId,
              grantedByUserId: data.actorUserId,
              grantedAt: Date.now(),
            }
          : entry,
      ),
      domainEvents: [
        ...this._domainEvents,
        projectEvents.roleChanged({
          projectId: this._id,
          actorUserId: data.actorUserId,
          targetUserId: data.targetUserId,
          roleId: data.roleId,
        }),
      ],
    })
  }

  hasAccess(userId: number) {
    return this._access.some((entry) => entry.userId === userId)
  }

  hasPermission(userId: number, permission: Permission) {
    const roleId = this._access.find((entry) => entry.userId === userId)?.roleId
    if (!roleId) return false
    return PROJECT_ROLE_PERMISSIONS[roleId].includes(permission)
  }

  userPermissions(userId: number): Permission[] {
    const roleId = this._access.find((entry) => entry.userId === userId)?.roleId
    if (!roleId) return []
    return [...PROJECT_ROLE_PERMISSIONS[roleId]]
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): ProjectPrimitives {
    return {
      id: this._id,
      workspaceId: this._workspaceId,
      name: this._name.value,
      description: this._description.value,
      access: this._access.map((entry) => ({ ...entry })),
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  get id() {
    return this._id
  }

  get workspaceId() {
    return this._workspaceId
  }

  get name() {
    return this._name.value
  }

  get description() {
    return this._description.value
  }

  get access() {
    return this._access.map((entry) => ({ ...entry }))
  }

  get createdAt() {
    return this._createdAt
  }
}
