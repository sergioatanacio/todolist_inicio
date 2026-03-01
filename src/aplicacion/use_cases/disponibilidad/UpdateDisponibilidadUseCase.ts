import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { EditingAuthorizationPolicy } from '../../../dominio/servicios/EditingAuthorizationPolicy'
import {
  type UpdateDisponibilidadCommand,
  validateUpdateDisponibilidadCommand,
} from '../../commands/disponibilidad/UpdateDisponibilidadCommand'

export class UpdateDisponibilidadUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateDisponibilidadCommand) {
    const input = validateUpdateDisponibilidadCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const project = this.projectRepository.findById(input.projectId)
      if (!project) {
        throw domainError('NOT_FOUND', 'Proyecto no encontrado')
      }
      const workspace = this.workspaceRepository.findById(project.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      EditingAuthorizationPolicy.ensureDisponibilidadEditable(
        workspace,
        project,
        input.actorUserId,
      )

      const disponibilidad = this.disponibilidadRepository.findById(
        input.disponibilidadId,
      )
      if (!disponibilidad) {
        throw domainError('NOT_FOUND', 'Disponibilidad no encontrada')
      }
      ContextIntegrityPolicy.ensureDisponibilidadInProject(
        disponibilidad,
        project,
        'La disponibilidad no pertenece al proyecto actual',
      )

      const nextDisponibilidad = disponibilidad
        .rename(input.name)
        .updateDescription(input.description)
        .changeDateRange(input.startDate, input.endDate)
      this.disponibilidadRepository.save(nextDisponibilidad)
      await this.eventPublisher.publishFrom(nextDisponibilidad)
      return nextDisponibilidad
    })
  }
}

