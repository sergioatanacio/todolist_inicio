import { DomainError } from '../errores/DomainError.ts'
import {
  PROJECT_ROLE_IDS,
  ProjectAggregate,
} from '../entidades/ProjectAggregate.ts'
import {
  SYSTEM_ROLE_IDS,
  WorkspaceAggregate,
} from '../entidades/WorkspaceAggregate.ts'
import { AuthorizationPolicy } from '../servicios/AuthorizationPolicy.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertThrows = (fn: () => void, expectedCode: DomainError['code']) => {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw new Error('Expected DomainError')
    }
    assert(
      error.code === expectedCode,
      `Expected code ${expectedCode} but got ${error.code}`,
    )
  }
}

const ownershipTransferCase = () => {
  const workspace = WorkspaceAggregate.create(1, 'Ops')
  const withMember = workspace.inviteMember(1, 2)

  assertThrows(() => withMember.transferOwnership(2, 1), 'FORBIDDEN')

  const transferred = withMember.transferOwnership(1, 2)
  assert(transferred.ownerUserId === 2, 'Ownership must be transferred to user 2')

  const previousOwnerAssignment = transferred.assignments.find(
    (entry) => entry.userId === 1,
  )
  const nextOwnerAssignment = transferred.assignments.find(
    (entry) => entry.userId === 2,
  )
  assert(
    previousOwnerAssignment?.roleIds.includes(SYSTEM_ROLE_IDS.ADMIN) ?? false,
    'Previous owner must receive admin role',
  )
  assert(
    !(previousOwnerAssignment?.roleIds.includes(SYSTEM_ROLE_IDS.OWNER) ?? false),
    'Previous owner must lose owner role',
  )
  assert(
    nextOwnerAssignment?.roleIds.includes(SYSTEM_ROLE_IDS.OWNER) ?? false,
    'New owner must include owner role',
  )
}

const revokeLastRoleCase = () => {
  const workspace = WorkspaceAggregate.create(1, 'Core')
  const withMember = workspace.inviteMember(1, 3)
  assertThrows(
    () => withMember.revokeRole(1, 3, SYSTEM_ROLE_IDS.COLLABORATOR),
    'INVALID_STATE',
  )
}

const crossProjectAccessCase = () => {
  const workspace = WorkspaceAggregate.create(10, 'Cross')
  const withMember = workspace.inviteMember(10, 20)

  const projectA = ProjectAggregate.create(
    workspace.id,
    10,
    'Proyecto A',
    'Descripcion A',
  )
  const projectAWithMember = projectA.grantAccess({
    actorUserId: 10,
    targetUserId: 20,
    roleId: PROJECT_ROLE_IDS.CONTRIBUTOR,
    targetIsWorkspaceMember: true,
  })
  const projectB = ProjectAggregate.create(
    workspace.id,
    10,
    'Proyecto B',
    'Descripcion B',
  )

  const canCreateOnA = AuthorizationPolicy.canInProject({
    workspace: withMember,
    project: projectAWithMember,
    actorUserId: 20,
    permission: 'task.create',
  })
  const canCreateOnB = AuthorizationPolicy.canInProject({
    workspace: withMember,
    project: projectB,
    actorUserId: 20,
    permission: 'task.create',
  })

  assert(canCreateOnA, 'User must create tasks on project A')
  assert(!canCreateOnB, 'User must not create tasks on project B')
}

export const rbacAdvancedSpec = () => {
  ownershipTransferCase()
  revokeLastRoleCase()
  crossProjectAccessCase()
}
