import type { ProjectAggregate } from '../entidades/ProjectAggregate'

export interface ProjectRepository {
  findById(id: string): ProjectAggregate | null
  findByWorkspaceId(workspaceId: string): ProjectAggregate[]
  save(project: ProjectAggregate): void
}
