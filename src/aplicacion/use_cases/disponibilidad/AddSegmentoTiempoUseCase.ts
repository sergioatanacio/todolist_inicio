import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type AddSegmentoTiempoCommand,
  validateAddSegmentoTiempoCommand,
} from '../../commands/disponibilidad/AddSegmentoTiempoCommand'

export class AddSegmentoTiempoUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: AddSegmentoTiempoCommand) {
    const input = validateAddSegmentoTiempoCommand(command)
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
        throw domainError(
          'FORBIDDEN',
          'No tienes permisos para modificar disponibilidades',
        )
      }
      const disponibilidad = this.disponibilidadRepository.findById(
        input.disponibilidadId,
      )
      if (!disponibilidad) {
        throw domainError('NOT_FOUND', 'Disponibilidad no encontrada')
      }
      if (disponibilidad.projectId !== project.id) {
        throw domainError(
          'CONFLICT',
          'La disponibilidad no pertenece al proyecto actual',
        )
      }

      const nextDisponibilidad = disponibilidad.addSegment({
        name: input.name,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        specificDates: input.specificDates,
        daysOfWeek: input.daysOfWeek,
        daysOfMonth: input.daysOfMonth,
      })
      this.disponibilidadRepository.save(nextDisponibilidad)
      await this.eventPublisher.publishFrom(nextDisponibilidad)
      return nextDisponibilidad
    })
  }
}
