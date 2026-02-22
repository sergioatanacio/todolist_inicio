import type { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'

export interface WorkspaceRepository {
  findById(id: string): WorkspaceAggregate | null
  save(workspace: WorkspaceAggregate): void
}
