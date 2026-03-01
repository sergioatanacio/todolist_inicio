import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../dominio/servicios/DomainEventPublisher'
import type { CreateProjectCommand } from './commands/project/CreateProjectCommand'
import type { UpdateProjectCommand } from './commands/project/UpdateProjectCommand'
import { CreateProjectUseCase } from './use_cases/project/CreateProjectUseCase'
import { ListProjectsByWorkspaceUseCase } from './use_cases/project/ListProjectsByWorkspaceUseCase'
import { UpdateProjectUseCase } from './use_cases/project/UpdateProjectUseCase'

export class ProjectAppService {
  private readonly createProjectUseCase: CreateProjectUseCase
  private readonly updateProjectUseCase: UpdateProjectUseCase
  private readonly listProjectsByWorkspaceUseCase: ListProjectsByWorkspaceUseCase

  constructor(
    projectRepository: ProjectRepository,
    workspaceRepository: WorkspaceRepository,
    unitOfWork: UnitOfWork,
    eventBus: DomainEventBus,
  ) {
    const eventPublisher = new DomainEventPublisher(eventBus)
    this.createProjectUseCase = new CreateProjectUseCase(
      projectRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.updateProjectUseCase = new UpdateProjectUseCase(
      projectRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.listProjectsByWorkspaceUseCase = new ListProjectsByWorkspaceUseCase(
      projectRepository,
    )
  }

  createProject(command: CreateProjectCommand) {
    return this.createProjectUseCase.execute(command)
  }

  updateProject(command: UpdateProjectCommand) {
    return this.updateProjectUseCase.execute(command)
  }

  listByWorkspace(workspaceId: string, actorUserId: number) {
    return this.listProjectsByWorkspaceUseCase.execute({ workspaceId, actorUserId })
  }
}
