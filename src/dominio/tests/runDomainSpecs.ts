import { aiAgentAggregateSpec } from './AiAgentAggregate.spec.ts'
import { aiAuthorizationPolicySpec } from './AiAuthorizationPolicy.spec.ts'
import { aiConversationAggregateSpec } from './AiConversationAggregate.spec.ts'
import { aiUserCredentialAggregateSpec } from './AiUserCredentialAggregate.spec.ts'
import { aiStateMachinesSpec } from './AiStateMachines.spec.ts'
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
import { greedySchedulingStrategySpec } from './GreedySchedulingStrategy.spec.ts'
import { schedulingPolicyDelegationSpec } from './SchedulingPolicyDelegation.spec.ts'
import { schedulingStrategyContractSpec } from './SchedulingStrategyContract.spec.ts'
import { domainEventPublisherSpec } from './DomainEventPublisher.spec.ts'
import { workspaceAggregateSpec } from './WorkspaceAggregate.spec.ts'
import { workspaceConversationAggregateSpec } from './WorkspaceConversationAggregate.spec.ts'
import { workspaceConversationMessageStateMachineSpec } from './WorkspaceConversationMessageStateMachine.spec.ts'
import { workspaceMemberStateMachineSpec } from './WorkspaceMemberStateMachine.spec.ts'
import { workspaceOwnershipStateMachineSpec } from './WorkspaceOwnershipStateMachine.spec.ts'

export const runDomainSpecs = async () => {
  aiStateMachinesSpec()
  aiAgentAggregateSpec()
  aiConversationAggregateSpec()
  aiUserCredentialAggregateSpec()
  aiAuthorizationPolicySpec()
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
  greedySchedulingStrategySpec()
  schedulingPolicyDelegationSpec()
  schedulingStrategyContractSpec()
  await domainEventPublisherSpec()
  workspaceMemberStateMachineSpec()
  workspaceOwnershipStateMachineSpec()
  workspaceConversationMessageStateMachineSpec()
  workspaceConversationAggregateSpec()
  return 'ok'
}
