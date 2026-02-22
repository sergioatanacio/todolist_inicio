import { disponibilidadAggregateSpec } from './DisponibilidadAggregate.spec.ts'
import { availabilityLifecycleStateMachineSpec } from './AvailabilityLifecycleStateMachine.spec.ts'
import { projectAccessStateMachineSpec } from './ProjectAccessStateMachine.spec.ts'
import { projectAggregateSpec } from './ProjectAggregate.spec.ts'
import { rbacAdvancedSpec } from './RbacAdvanced.spec.ts'
import { taskAggregateSpec } from './TaskAggregate.spec.ts'
import { taskCommentStateMachineSpec } from './TaskCommentStateMachine.spec.ts'
import { taskStateMachineSpec } from './TaskStateMachine.spec.ts'
import { taskWorkflowServiceSpec } from './TaskWorkflowService.spec.ts'
import { todoListAggregateSpec } from './TodoListAggregate.spec.ts'
import { schedulingPolicySpec } from './SchedulingPolicy.spec.ts'
import { workspaceAggregateSpec } from './WorkspaceAggregate.spec.ts'
import { workspaceConversationAggregateSpec } from './WorkspaceConversationAggregate.spec.ts'
import { workspaceConversationMessageStateMachineSpec } from './WorkspaceConversationMessageStateMachine.spec.ts'
import { workspaceMemberStateMachineSpec } from './WorkspaceMemberStateMachine.spec.ts'
import { workspaceOwnershipStateMachineSpec } from './WorkspaceOwnershipStateMachine.spec.ts'

export const runDomainSpecs = () => {
  workspaceAggregateSpec()
  projectAccessStateMachineSpec()
  projectAggregateSpec()
  rbacAdvancedSpec()
  availabilityLifecycleStateMachineSpec()
  disponibilidadAggregateSpec()
  taskStateMachineSpec()
  taskCommentStateMachineSpec()
  taskAggregateSpec()
  taskWorkflowServiceSpec()
  todoListAggregateSpec()
  schedulingPolicySpec()
  workspaceMemberStateMachineSpec()
  workspaceOwnershipStateMachineSpec()
  workspaceConversationMessageStateMachineSpec()
  workspaceConversationAggregateSpec()
  return 'ok'
}
