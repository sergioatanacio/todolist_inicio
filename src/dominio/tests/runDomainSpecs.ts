import { disponibilidadAggregateSpec } from './DisponibilidadAggregate.spec.ts'
import { projectAggregateSpec } from './ProjectAggregate.spec.ts'
import { rbacAdvancedSpec } from './RbacAdvanced.spec.ts'
import { taskAggregateSpec } from './TaskAggregate.spec.ts'
import { taskStateMachineSpec } from './TaskStateMachine.spec.ts'
import { taskWorkflowServiceSpec } from './TaskWorkflowService.spec.ts'
import { workspaceAggregateSpec } from './WorkspaceAggregate.spec.ts'
import { workspaceConversationAggregateSpec } from './WorkspaceConversationAggregate.spec.ts'

export const runDomainSpecs = () => {
  workspaceAggregateSpec()
  projectAggregateSpec()
  rbacAdvancedSpec()
  disponibilidadAggregateSpec()
  taskStateMachineSpec()
  taskAggregateSpec()
  taskWorkflowServiceSpec()
  workspaceConversationAggregateSpec()
  return 'ok'
}
