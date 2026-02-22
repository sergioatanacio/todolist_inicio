import type { WorkspaceAggregate } from '../dominio/entidades/WorkspaceAggregate'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly items = new Map<string, WorkspaceAggregate>()

  findById(id: string) {
    return this.items.get(id) ?? null
  }

  save(workspace: WorkspaceAggregate) {
    this.items.set(workspace.id, workspace)
  }
}
