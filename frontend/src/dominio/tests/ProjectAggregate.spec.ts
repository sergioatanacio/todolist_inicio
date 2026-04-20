import { DomainError } from '../errores/DomainError.ts'
import {
  PROJECT_ROLE_IDS,
  ProjectAggregate,
} from '../entidades/ProjectAggregate.ts'

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

export const projectAggregateSpec = () => {
  const project = ProjectAggregate.create('ws-1', 10, 'Proyecto A', 'Descripcion')
  assert(project.hasAccess(10), 'Creator must have access')

  assertThrows(
    () =>
      project.grantAccess({
        actorUserId: 20,
        targetUserId: 30,
        roleId: PROJECT_ROLE_IDS.CONTRIBUTOR,
        targetIsWorkspaceMember: true,
      }),
    'FORBIDDEN',
  )

  const withAccess = project.grantAccess({
    actorUserId: 10,
    targetUserId: 30,
    roleId: PROJECT_ROLE_IDS.CONTRIBUTOR,
    targetIsWorkspaceMember: true,
  })
  assert(withAccess.hasAccess(30), 'Target member must have access')
  assert(withAccess.hasPermission(30, 'task.create'), 'Contributor must create tasks')
}
