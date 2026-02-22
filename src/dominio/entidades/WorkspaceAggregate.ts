import { domainError } from '../errores/DomainError'
import {
  type WorkspaceDomainEvent,
  workspaceEvents,
} from '../eventos/WorkspaceEvents'
import { type Permission, isPermission } from '../valores_objeto/Permission'

export const SYSTEM_ROLE_IDS = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  COLLABORATOR: 'collaborator',
} as const

type WorkspaceMemberPrimitives = {
  userId: number
  active: boolean
  joinedAt: number
}

type WorkspaceRolePrimitives = {
  id: string
  name: string
  permissions: Permission[]
  isSystem: boolean
}

type WorkspaceRoleAssignmentPrimitives = {
  userId: number
  roleIds: string[]
}

type WorkspacePrimitives = {
  id: string
  ownerUserId: number
  name: string
  members: WorkspaceMemberPrimitives[]
  roles: WorkspaceRolePrimitives[]
  assignments: WorkspaceRoleAssignmentPrimitives[]
  domainEvents?: WorkspaceDomainEvent[]
  createdAt: number
}

type WorkspaceRoleDraft = {
  id: string
  name: string
  permissions: Permission[]
  isSystem: boolean
}

const normalizeWorkspaceName = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', 'El nombre del workspace no puede estar vacio')
  }
  if (normalized.length > 100) {
    throw domainError('VALIDATION_ERROR', 'El nombre del workspace excede 100 caracteres')
  }
  return normalized
}

const normalizeRoleName = (raw: string) => {
  const normalized = raw.trim()
  if (normalized.length < 2) {
    throw domainError('VALIDATION_ERROR', 'El nombre del rol es demasiado corto')
  }
  if (normalized.length > 60) {
    throw domainError('VALIDATION_ERROR', 'El nombre del rol es demasiado largo')
  }
  return normalized
}

const uniquePermissions = (permissions: string[]) => {
  const next = new Set<Permission>()
  for (const permission of permissions) {
    if (!isPermission(permission)) {
      throw domainError('VALIDATION_ERROR', `Permiso invalido: ${permission}`)
    }
    next.add(permission)
  }
  return [...next]
}

const defaultSystemRoles = (): WorkspaceRoleDraft[] => [
  {
    id: SYSTEM_ROLE_IDS.OWNER,
    name: 'Owner',
    isSystem: true,
    permissions: uniquePermissions([
      'workspace.members.manage',
      'workspace.roles.manage',
      'workspace.ownership.transfer',
      'workspace.chat.all_members',
      'project.create',
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
    ]),
  },
  {
    id: SYSTEM_ROLE_IDS.ADMIN,
    name: 'Admin',
    isSystem: true,
    permissions: uniquePermissions([
      'workspace.members.manage',
      'workspace.roles.manage',
      'workspace.chat.all_members',
      'project.create',
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
    ]),
  },
  {
    id: SYSTEM_ROLE_IDS.EDITOR,
    name: 'Editor',
    isSystem: true,
    permissions: uniquePermissions([
      'workspace.chat.project_members_only',
      'project.view',
      'project.todolists.create',
      'project.availability.create',
      'task.create',
      'task.update',
      'task.assign',
      'task.status.update',
      'task.status.toggle_done',
      'task.comment.add',
    ]),
  },
  {
    id: SYSTEM_ROLE_IDS.COLLABORATOR,
    name: 'Collaborator',
    isSystem: true,
    permissions: uniquePermissions([
      'workspace.chat.project_members_only',
      'project.view',
      'task.status.toggle_done',
      'task.comment.add',
    ]),
  },
]

export class WorkspaceAggregate {
  private readonly _id: string
  private readonly _ownerUserId: number
  private readonly _name: string
  private readonly _members: readonly WorkspaceMemberPrimitives[]
  private readonly _roles: readonly WorkspaceRolePrimitives[]
  private readonly _assignments: readonly WorkspaceRoleAssignmentPrimitives[]
  private readonly _domainEvents: readonly WorkspaceDomainEvent[]
  private readonly _createdAt: number

  private constructor(data: WorkspacePrimitives) {
    this._id = data.id
    this._ownerUserId = data.ownerUserId
    this._name = data.name
    this._members = data.members
    this._roles = data.roles
    this._assignments = data.assignments
    this._domainEvents = data.domainEvents ?? []
    this._createdAt = data.createdAt
  }

  static create(ownerUserId: number, rawName: string) {
    const roles = defaultSystemRoles()
    const name = normalizeWorkspaceName(rawName)
    return new WorkspaceAggregate({
      id: crypto.randomUUID(),
      ownerUserId,
      name,
      members: [{ userId: ownerUserId, active: true, joinedAt: Date.now() }],
      roles,
      assignments: [{ userId: ownerUserId, roleIds: [SYSTEM_ROLE_IDS.OWNER] }],
      domainEvents: [workspaceEvents.created({ ownerUserId, name })],
      createdAt: Date.now(),
    })
  }

  static rehydrate(data: WorkspacePrimitives) {
    const rolesById = new Set<string>()
    for (const role of data.roles) {
      if (rolesById.has(role.id)) {
        throw domainError('DUPLICATE', 'Rol duplicado en workspace')
      }
      rolesById.add(role.id)
      normalizeRoleName(role.name)
      uniquePermissions(role.permissions)
    }
    if (!rolesById.has(SYSTEM_ROLE_IDS.OWNER)) {
      throw domainError('INVALID_STATE', 'El workspace requiere el rol de sistema OWNER')
    }

    const membersByUser = new Set<number>()
    for (const member of data.members) {
      if (membersByUser.has(member.userId)) {
        throw domainError('DUPLICATE', 'Miembro duplicado en workspace')
      }
      membersByUser.add(member.userId)
    }
    if (!membersByUser.has(data.ownerUserId)) {
      throw domainError('INVALID_STATE', 'El propietario debe ser miembro del workspace')
    }

    const normalizedAssignments = data.assignments.map((assignment) => {
      if (!membersByUser.has(assignment.userId)) {
        throw domainError('INVALID_STATE', 'Asignacion para usuario no miembro')
      }
      const uniqueRoleIds = [...new Set(assignment.roleIds)]
      if (uniqueRoleIds.length === 0) {
        throw domainError('INVALID_STATE', 'Un miembro debe tener al menos un rol')
      }
      for (const roleId of uniqueRoleIds) {
        if (!rolesById.has(roleId)) {
          throw domainError('INVALID_STATE', 'Asignacion contiene rol inexistente')
        }
      }
      return { userId: assignment.userId, roleIds: uniqueRoleIds }
    })
    const ownerAssignment = normalizedAssignments.find(
      (assignment) => assignment.userId === data.ownerUserId,
    )
    if (!ownerAssignment?.roleIds.includes(SYSTEM_ROLE_IDS.OWNER)) {
      throw domainError('INVALID_STATE', 'El propietario debe tener rol OWNER')
    }

    return new WorkspaceAggregate({
      id: data.id,
      ownerUserId: data.ownerUserId,
      name: normalizeWorkspaceName(data.name),
      members: data.members,
      roles: data.roles.map((role) => ({
        id: role.id,
        name: normalizeRoleName(role.name),
        permissions: uniquePermissions(role.permissions),
        isSystem: role.isSystem,
      })),
      assignments: normalizedAssignments,
      domainEvents: data.domainEvents ?? [],
      createdAt: data.createdAt,
    })
  }

  rename(rawName: string) {
    return this.cloneWith({ name: normalizeWorkspaceName(rawName) })
  }

  inviteMember(actorUserId: number, newUserId: number) {
    this.ensureMemberPermission(actorUserId, 'workspace.members.manage')
    if (this._members.some((member) => member.userId === newUserId)) {
      throw domainError('DUPLICATE', 'El usuario ya pertenece al workspace')
    }
    return this.cloneWith({
      members: [
        ...this._members,
        { userId: newUserId, active: true, joinedAt: Date.now() },
      ],
      assignments: [
        ...this._assignments,
        { userId: newUserId, roleIds: [SYSTEM_ROLE_IDS.COLLABORATOR] },
      ],
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.memberAdded({
          workspaceId: this._id,
          actorUserId,
          targetUserId: newUserId,
        }),
      ],
    })
  }

  removeMember(actorUserId: number, targetUserId: number) {
    this.ensureMemberPermission(actorUserId, 'workspace.members.manage')
    if (targetUserId === this._ownerUserId) {
      throw domainError('FORBIDDEN', 'No se puede remover al propietario del workspace')
    }
    return this.cloneWith({
      members: this._members.filter((member) => member.userId !== targetUserId),
      assignments: this._assignments.filter(
        (assignment) => assignment.userId !== targetUserId,
      ),
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.memberRemoved({
          workspaceId: this._id,
          actorUserId,
          targetUserId,
        }),
      ],
    })
  }

  createCustomRole(actorUserId: number, rawName: string, permissions: string[]) {
    this.ensureMemberPermission(actorUserId, 'workspace.roles.manage')
    const name = normalizeRoleName(rawName)
    if (this._roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
      throw domainError('DUPLICATE', 'Ya existe un rol con ese nombre')
    }
    const roleId = crypto.randomUUID()
    return this.cloneWith({
      roles: [
        ...this._roles,
        {
          id: roleId,
          name,
          permissions: uniquePermissions(permissions),
          isSystem: false,
        },
      ],
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.roleCreated({
          workspaceId: this._id,
          actorUserId,
          roleId,
        }),
      ],
    })
  }

  updateCustomRole(actorUserId: number, roleId: string, permissions: string[]) {
    this.ensureMemberPermission(actorUserId, 'workspace.roles.manage')
    const role = this.getRoleById(roleId)
    if (role.isSystem) {
      throw domainError('FORBIDDEN', 'No se puede editar un rol de sistema')
    }
    return this.cloneWith({
      roles: this._roles.map((current) =>
        current.id === roleId
          ? { ...current, permissions: uniquePermissions(permissions) }
          : current,
      ),
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.roleUpdated({
          workspaceId: this._id,
          actorUserId,
          roleId,
        }),
      ],
    })
  }

  deleteCustomRole(actorUserId: number, roleId: string) {
    this.ensureMemberPermission(actorUserId, 'workspace.roles.manage')
    const role = this.getRoleById(roleId)
    if (role.isSystem) {
      throw domainError('FORBIDDEN', 'No se puede eliminar un rol de sistema')
    }
    if (this._assignments.some((assignment) => assignment.roleIds.includes(roleId))) {
      throw domainError('CONFLICT', 'No se puede eliminar un rol que esta asignado')
    }
    return this.cloneWith({
      roles: this._roles.filter((current) => current.id !== roleId),
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.roleDeleted({
          workspaceId: this._id,
          actorUserId,
          roleId,
        }),
      ],
    })
  }

  assignRole(actorUserId: number, targetUserId: number, roleId: string) {
    this.ensureMemberPermission(actorUserId, 'workspace.roles.manage')
    this.ensureMemberExists(targetUserId)
    this.getRoleById(roleId)
    return this.cloneWith({
      assignments: this._assignments.map((assignment) => {
        if (assignment.userId !== targetUserId) return assignment
        if (assignment.roleIds.includes(roleId)) return assignment
        return { ...assignment, roleIds: [...assignment.roleIds, roleId] }
      }),
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.roleAssigned({
          workspaceId: this._id,
          actorUserId,
          targetUserId,
          roleId,
        }),
      ],
    })
  }

  revokeRole(actorUserId: number, targetUserId: number, roleId: string) {
    this.ensureMemberPermission(actorUserId, 'workspace.roles.manage')
    this.ensureMemberExists(targetUserId)
    const nextAssignments = this._assignments.map((assignment) => {
      if (assignment.userId !== targetUserId) return assignment
      const nextRoleIds = assignment.roleIds.filter((id) => id !== roleId)
      if (nextRoleIds.length === 0) {
        throw domainError('INVALID_STATE', 'Un miembro no puede quedarse sin roles')
      }
      return { ...assignment, roleIds: nextRoleIds }
    })
    if (targetUserId === this._ownerUserId) {
      const owner = nextAssignments.find((entry) => entry.userId === targetUserId)
      if (!owner?.roleIds.includes(SYSTEM_ROLE_IDS.OWNER)) {
        throw domainError('INVALID_STATE', 'El propietario debe conservar el rol OWNER')
      }
    }
    return this.cloneWith({
      assignments: nextAssignments,
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.roleRevoked({
          workspaceId: this._id,
          actorUserId,
          targetUserId,
          roleId,
        }),
      ],
    })
  }

  transferOwnership(actorUserId: number, nextOwnerUserId: number) {
    if (actorUserId !== this._ownerUserId) {
      throw domainError('FORBIDDEN', 'Solo el propietario puede transferir la propiedad')
    }
    this.ensureMemberExists(nextOwnerUserId)
    const nextAssignments = this._assignments.map((assignment) => {
      if (assignment.userId === nextOwnerUserId) {
        const roleIds = assignment.roleIds.includes(SYSTEM_ROLE_IDS.OWNER)
          ? assignment.roleIds
          : [...assignment.roleIds, SYSTEM_ROLE_IDS.OWNER]
        return { ...assignment, roleIds }
      }
      if (assignment.userId === this._ownerUserId) {
        const withoutOwner = assignment.roleIds.filter(
          (id) => id !== SYSTEM_ROLE_IDS.OWNER,
        )
        const withAdmin = withoutOwner.includes(SYSTEM_ROLE_IDS.ADMIN)
          ? withoutOwner
          : [...withoutOwner, SYSTEM_ROLE_IDS.ADMIN]
        return { ...assignment, roleIds: withAdmin }
      }
      return assignment
    })
    return this.cloneWith({
      ownerUserId: nextOwnerUserId,
      assignments: nextAssignments,
      domainEvents: [
        ...this._domainEvents,
        workspaceEvents.ownershipTransferred({
          workspaceId: this._id,
          previousOwnerUserId: this._ownerUserId,
          nextOwnerUserId,
        }),
      ],
    })
  }

  hasPermission(userId: number, permission: Permission) {
    if (!this.isMemberActive(userId)) return false
    const roleIds = this.getRoleIdsByUser(userId)
    return this._roles.some(
      (role) =>
        roleIds.includes(role.id) && role.permissions.includes(permission),
    )
  }

  memberPermissions(userId: number): Permission[] {
    if (!this.isMemberActive(userId)) return []
    const roleIds = this.getRoleIdsByUser(userId)
    const next = new Set<Permission>()
    for (const role of this._roles) {
      if (roleIds.includes(role.id)) {
        for (const permission of role.permissions) {
          next.add(permission)
        }
      }
    }
    return [...next]
  }

  pullDomainEvents() {
    return this._domainEvents.map((event) => ({ ...event }))
  }

  toPrimitives(): WorkspacePrimitives {
    return {
      id: this._id,
      ownerUserId: this._ownerUserId,
      name: this._name,
      members: this._members.map((member) => ({ ...member })),
      roles: this._roles.map((role) => ({
        ...role,
        permissions: [...role.permissions],
      })),
      assignments: this._assignments.map((assignment) => ({
        ...assignment,
        roleIds: [...assignment.roleIds],
      })),
      domainEvents: this._domainEvents.map((event) => ({ ...event })),
      createdAt: this._createdAt,
    }
  }

  private cloneWith(
    patch: Partial<{
      ownerUserId: number
      name: string
      members: readonly WorkspaceMemberPrimitives[]
      roles: readonly WorkspaceRolePrimitives[]
      assignments: readonly WorkspaceRoleAssignmentPrimitives[]
      domainEvents: readonly WorkspaceDomainEvent[]
    }>,
  ) {
    return WorkspaceAggregate.rehydrate({
      id: this._id,
      ownerUserId: patch.ownerUserId ?? this._ownerUserId,
      name: patch.name ?? this._name,
      members: [...(patch.members ?? this._members)],
      roles: [...(patch.roles ?? this._roles)],
      assignments: [...(patch.assignments ?? this._assignments)],
      domainEvents: [...(patch.domainEvents ?? this._domainEvents)],
      createdAt: this._createdAt,
    })
  }

  private ensureMemberPermission(userId: number, permission: Permission) {
    if (!this.hasPermission(userId, permission)) {
      throw domainError('FORBIDDEN', 'El usuario no tiene permisos para esta accion')
    }
  }

  private ensureMemberExists(userId: number) {
    if (!this._members.some((member) => member.userId === userId && member.active)) {
      throw domainError('NOT_FOUND', 'El usuario no es miembro activo del workspace')
    }
  }

  private isMemberActive(userId: number) {
    return this._members.some((member) => member.userId === userId && member.active)
  }

  private getRoleById(roleId: string) {
    const role = this._roles.find((current) => current.id === roleId)
    if (!role) throw domainError('NOT_FOUND', 'Rol no encontrado')
    return role
  }

  private getRoleIdsByUser(userId: number) {
    const assignment = this._assignments.find((entry) => entry.userId === userId)
    return assignment?.roleIds ?? []
  }

  get id() {
    return this._id
  }

  get ownerUserId() {
    return this._ownerUserId
  }

  get name() {
    return this._name
  }

  get members() {
    return this._members.map((member) => ({ ...member }))
  }

  get roles() {
    return this._roles.map((role) => ({
      ...role,
      permissions: [...role.permissions],
    }))
  }

  get assignments() {
    return this._assignments.map((assignment) => ({
      ...assignment,
      roleIds: [...assignment.roleIds],
    }))
  }

  get createdAt() {
    return this._createdAt
  }
}
