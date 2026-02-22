import type { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'

export interface WorkspaceRepository {
  findById(id: string): WorkspaceAggregate | null
  findByOwnerUserId(ownerUserId: number): WorkspaceAggregate[]
  save(workspace: WorkspaceAggregate): void
}
