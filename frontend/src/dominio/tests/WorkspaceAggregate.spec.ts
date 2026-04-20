import { DomainError } from '../errores/DomainError.ts'
import {
  SYSTEM_ROLE_IDS,
  WorkspaceAggregate,
} from '../entidades/WorkspaceAggregate.ts'

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

export const workspaceAggregateSpec = () => {
  const workspace = WorkspaceAggregate.create(1, 'Equipo Core')

  assert(workspace.ownerUserId === 1, 'Owner must be creator')
  assert(
    workspace.assignments[0].roleIds.includes(SYSTEM_ROLE_IDS.OWNER),
    'Owner assignment must include owner role',
  )

  assertThrows(() => workspace.inviteMember(99, 2), 'FORBIDDEN')

  const withMember = workspace.inviteMember(1, 2)
  assert(withMember.members.some((member) => member.userId === 2), 'Member must exist')
  const removed = withMember.removeMember(1, 2)
  assert(
    removed.members.some((member) => member.userId === 2 && !member.active),
    'Removed member should remain registered as inactive',
  )
  const reactivated = removed.inviteMember(1, 2)
  assert(
    reactivated.members.some((member) => member.userId === 2 && member.active),
    'Invite should reactivate previously removed member',
  )
  assert(
    reactivated
      .pullDomainEvents()
      .some((event) => event.type === 'workspace.member_reactivated'),
    'Reactivated flow must emit workspace.member_reactivated',
  )

  const transferred = reactivated.transferOwnership(1, 2)
  assert(transferred.ownerUserId === 2, 'Ownership must be transferred')
  assertThrows(
    () => transferred.transferOwnership(2, 2),
    'INVALID_STATE',
  )
}
