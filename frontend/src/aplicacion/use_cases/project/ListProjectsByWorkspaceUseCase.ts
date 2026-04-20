import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'

type ListProjectsByWorkspaceInput = {
  workspaceId: string
  actorUserId: number
}

export class ListProjectsByWorkspaceUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  execute(input: ListProjectsByWorkspaceInput) {
    return this.projectRepository
      .findByWorkspaceId(input.workspaceId)
      .filter((project) => project.hasAccess(input.actorUserId))
  }
}
