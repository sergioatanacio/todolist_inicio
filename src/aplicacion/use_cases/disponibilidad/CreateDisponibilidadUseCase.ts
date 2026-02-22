import { DisponibilidadAggregate } from '../../../dominio/entidades/DisponibilidadAggregate'
import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type CreateDisponibilidadCommand,
  validateCreateDisponibilidadCommand,
} from '../../commands/disponibilidad/CreateDisponibilidadCommand'

export class CreateDisponibilidadUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateDisponibilidadCommand) {
    const input = validateCreateDisponibilidadCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const project = this.projectRepository.findById(input.projectId)
      if (!project) {
        throw domainError('NOT_FOUND', 'Proyecto no encontrado')
      }
      const workspace = this.workspaceRepository.findById(project.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      if (
        !AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'project.availability.create',
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para crear disponibilidad')
      }
      const disponibilidad = DisponibilidadAggregate.create({
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
      })
      this.disponibilidadRepository.save(disponibilidad)
      await this.eventPublisher.publishFrom(disponibilidad)
      return disponibilidad
    })
  }
}
