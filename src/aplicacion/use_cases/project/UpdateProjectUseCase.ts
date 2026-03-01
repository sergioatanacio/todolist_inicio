import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type UpdateProjectCommand,
  validateUpdateProjectCommand,
} from '../../commands/project/UpdateProjectCommand'

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateProjectCommand) {
    const input = validateUpdateProjectCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const project = this.projectRepository.findById(input.projectId)
      if (!project || project.workspaceId !== input.workspaceId) {
        throw domainError('NOT_FOUND', 'Proyecto no encontrado')
      }

      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      if (
        !AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'project.access.manage',
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para editar proyectos')
      }

      const nextProject = project.rename(input.name).updateDescription(input.description)
      this.projectRepository.save(nextProject)
      await this.eventPublisher.publishFrom(nextProject)
      return nextProject
    })
  }
}

