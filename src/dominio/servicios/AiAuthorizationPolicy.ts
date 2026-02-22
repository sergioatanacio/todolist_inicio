import { ProjectAggregate } from '../entidades/ProjectAggregate'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'
import { AiAgentAggregate } from '../entidades/AiAgentAggregate'
import { AuthorizationPolicy } from './AuthorizationPolicy'
import type { Permission } from '../valores_objeto/Permission'
import type { AiIntentType } from '../valores_objeto/AiIntentType'

const INTENT_PERMISSION: Record<AiIntentType, Permission> = {
  READ_TASKS_DUE_TOMORROW: 'project.view',
  CREATE_PROJECT: 'project.create',
  CREATE_TODO_LIST: 'project.todolists.create',
  CREATE_DISPONIBILIDAD: 'project.availability.create',
  CREATE_TASK: 'task.create',
  UPDATE_TASK_STATUS: 'task.status.update',
  ADD_TASK_COMMENT: 'task.comment.add',
}

const WORKSPACE_SCOPED_INTENTS: readonly AiIntentType[] = ['CREATE_PROJECT']

export class AiAuthorizationPolicy {
  static canExecute(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate | null
    agent: AiAgentAggregate
    initiatorUserId: number
    intent: AiIntentType
  }) {
    if (data.agent.workspaceId !== data.workspace.id) return false
    if (data.agent.state !== 'ACTIVE') return false
    if (!data.agent.policy.allows(data.intent)) return false

    const permission = INTENT_PERMISSION[data.intent]
    if (WORKSPACE_SCOPED_INTENTS.includes(data.intent)) {
      return AuthorizationPolicy.canInWorkspace(
        data.workspace,
        data.initiatorUserId,
        permission,
      )
    }

    if (!data.project) return false
    return AuthorizationPolicy.canInProject({
      workspace: data.workspace,
      project: data.project,
      actorUserId: data.initiatorUserId,
      permission,
    })
  }
}
