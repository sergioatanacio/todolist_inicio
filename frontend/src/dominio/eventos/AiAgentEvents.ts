import { type DomainEvent, createDomainEvent } from './DomainEvent'

export type AiAgentCreatedEvent = DomainEvent<{
  agentId: string
  workspaceId: string
  createdByUserId: number
}> & { type: 'ai.agent.created' }

export type AiAgentPolicyUpdatedEvent = DomainEvent<{
  agentId: string
  actorUserId: number
}> & { type: 'ai.agent.policy_updated' }

export type AiAgentStateChangedEvent = DomainEvent<{
  agentId: string
  actorUserId: number
  toState: 'ACTIVE' | 'PAUSED' | 'REVOKED'
}> & { type: 'ai.agent.state_changed' }

export type AiAgentDomainEvent =
  | AiAgentCreatedEvent
  | AiAgentPolicyUpdatedEvent
  | AiAgentStateChangedEvent

export const aiAgentEvents = {
  created: (payload: AiAgentCreatedEvent['payload']): AiAgentCreatedEvent =>
    createDomainEvent('ai.agent.created', payload) as AiAgentCreatedEvent,
  policyUpdated: (
    payload: AiAgentPolicyUpdatedEvent['payload'],
  ): AiAgentPolicyUpdatedEvent =>
    createDomainEvent(
      'ai.agent.policy_updated',
      payload,
    ) as AiAgentPolicyUpdatedEvent,
  stateChanged: (
    payload: AiAgentStateChangedEvent['payload'],
  ): AiAgentStateChangedEvent =>
    createDomainEvent('ai.agent.state_changed', payload) as AiAgentStateChangedEvent,
}
