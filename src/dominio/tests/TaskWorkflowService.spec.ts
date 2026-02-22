import { DomainError } from '../errores/DomainError.ts'
import { PROJECT_ROLE_IDS, ProjectAggregate } from '../entidades/ProjectAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate.ts'
import { TaskWorkflowService } from '../servicios/TaskWorkflowService.ts'

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

export const taskWorkflowServiceSpec = () => {
  const workflow = new TaskWorkflowService()

  const workspace = WorkspaceAggregate.create(1, 'W')
  const workspaceWithMember = workspace.inviteMember(1, 2)
  const project = ProjectAggregate.create('ws-1', 1, 'P', 'D')
  const projectWithMember = project.grantAccess({
    actorUserId: 1,
    targetUserId: 2,
    roleId: PROJECT_ROLE_IDS.TRACKER,
    targetIsWorkspaceMember: true,
  })
  const task = TaskAggregate.create({
    projectId: projectWithMember.id,
    todoListId: 'l-1',
    title: 'T',
    createdByUserId: 1,
  })

  assertThrows(
    () =>
      workflow.changeStatus(task, 'IN_PROGRESS', {
        workspace: workspaceWithMember,
        project: projectWithMember,
        actorUserId: 2,
      }),
    'FORBIDDEN',
  )

  const toggled = workflow.toggleDone(task, {
    workspace: workspaceWithMember,
    project: projectWithMember,
    actorUserId: 2,
  })
  assert(toggled.status === 'DONE', 'Tracker should be able to toggle done')
}
