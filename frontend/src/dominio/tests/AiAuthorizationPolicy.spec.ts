import { AiAgentAggregate } from '../entidades/AiAgentAggregate.ts'
import { PROJECT_ROLE_IDS, ProjectAggregate } from '../entidades/ProjectAggregate.ts'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate.ts'
import { AiAuthorizationPolicy } from '../servicios/AiAuthorizationPolicy.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

export const aiAuthorizationPolicySpec = () => {
  const workspace = WorkspaceAggregate.create(1, 'Workspace IA')
  const workspaceWithMember = workspace.inviteMember(1, 2)
  const project = ProjectAggregate.create(workspace.id, 1, 'Proyecto IA', 'demo')
  const projectWithMember = project.grantAccess({
    actorUserId: 1,
    targetUserId: 2,
    roleId: PROJECT_ROLE_IDS.CONTRIBUTOR,
    targetIsWorkspaceMember: true,
  })

  const agent = AiAgentAggregate.create({
    workspaceId: workspace.id,
    createdByUserId: 1,
    provider: 'openai',
    model: 'gpt-5',
    policy: {
      allowedIntents: ['CREATE_TASK', 'READ_TASKS_DUE_TOMORROW'],
      requireApprovalForWrites: true,
    },
  })

  const canCreateTask = AiAuthorizationPolicy.canExecute({
    workspace: workspaceWithMember,
    project: projectWithMember,
    agent,
    initiatorUserId: 2,
    intent: 'CREATE_TASK',
  })
  assert(canCreateTask, 'Delegated actor should create task with project contributor role')

  const canCreateProject = AiAuthorizationPolicy.canExecute({
    workspace: workspaceWithMember,
    project: projectWithMember,
    agent,
    initiatorUserId: 2,
    intent: 'CREATE_PROJECT',
  })
  assert(!canCreateProject, 'Agent should not execute intent outside its own policy')

  const revokedAgent = agent.revoke(1)
  const canReadAfterRevoke = AiAuthorizationPolicy.canExecute({
    workspace: workspaceWithMember,
    project: projectWithMember,
    agent: revokedAgent,
    initiatorUserId: 2,
    intent: 'READ_TASKS_DUE_TOMORROW',
  })
  assert(!canReadAfterRevoke, 'Revoked agent cannot execute intents')
}
