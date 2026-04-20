import { ProjectAggregate } from '../../../dominio/entidades/ProjectAggregate'
import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type CreateProjectCommand,
  validateCreateProjectCommand,
} from '../../commands/project/CreateProjectCommand'

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateProjectCommand) {
    const input = validateCreateProjectCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      if (!workspace.hasPermission(input.actorUserId, 'project.create')) {
        throw domainError('FORBIDDEN', 'No tienes permisos para crear proyectos')
      }
      const project = ProjectAggregate.create(
        input.workspaceId,
        input.actorUserId,
        input.name,
        input.description,
      )
      this.projectRepository.save(project)
      await this.eventPublisher.publishFrom(project)
      return project
    })
  }
}
