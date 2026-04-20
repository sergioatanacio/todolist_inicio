import type { AiConversationAggregate } from '../entidades/AiConversationAggregate'

export interface AiConversationRepository {
  findById(id: string): AiConversationAggregate | null
  findByWorkspaceId(workspaceId: string): AiConversationAggregate[]
  save(conversation: AiConversationAggregate): void
}
