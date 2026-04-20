import type { AiUserCredentialAggregate } from '../entidades/AiUserCredentialAggregate'

export interface AiUserCredentialRepository {
  findByWorkspaceAndUser(
    workspaceId: string,
    userId: number,
  ): AiUserCredentialAggregate | null
  save(credential: AiUserCredentialAggregate): void
}
