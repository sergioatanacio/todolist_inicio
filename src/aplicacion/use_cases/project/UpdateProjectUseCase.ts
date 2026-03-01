import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { EditingAuthorizationPolicy } from '../../../dominio/servicios/EditingAuthorizationPolicy'
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
      ContextIntegrityPolicy.ensureProjectInWorkspace(
        workspace,
        project,
        'Proyecto no encontrado',
      )
      EditingAuthorizationPolicy.ensureProjectEditable(
        workspace,
        project,
        input.actorUserId,
      )

      const nextProject = project.rename(input.name).updateDescription(input.description)
      this.projectRepository.save(nextProject)
      await this.eventPublisher.publishFrom(nextProject)
      return nextProject
    })
  }
}

