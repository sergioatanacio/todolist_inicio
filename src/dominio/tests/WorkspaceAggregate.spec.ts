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

  const transferred = withMember.transferOwnership(1, 2)
  assert(transferred.ownerUserId === 2, 'Ownership must be transferred')
}
