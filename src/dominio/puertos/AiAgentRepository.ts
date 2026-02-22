import type { AiAgentAggregate } from '../entidades/AiAgentAggregate'

export interface AiAgentRepository {
  findById(id: string): AiAgentAggregate | null
  findByWorkspaceId(workspaceId: string): AiAgentAggregate[]
  save(agent: AiAgentAggregate): void
}
