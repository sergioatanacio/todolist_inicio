import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../dominio/servicios/DomainEventPublisher'
import type { AddSegmentoTiempoCommand } from './commands/disponibilidad/AddSegmentoTiempoCommand'
import type { CreateDisponibilidadCommand } from './commands/disponibilidad/CreateDisponibilidadCommand'
import type { UpdateDisponibilidadCommand } from './commands/disponibilidad/UpdateDisponibilidadCommand'
import { AddSegmentoTiempoUseCase } from './use_cases/disponibilidad/AddSegmentoTiempoUseCase'
import { CreateDisponibilidadUseCase } from './use_cases/disponibilidad/CreateDisponibilidadUseCase'
import { ListDisponibilidadesByWorkspaceUseCase } from './use_cases/disponibilidad/ListDisponibilidadesByWorkspaceUseCase'
import { UpdateDisponibilidadUseCase } from './use_cases/disponibilidad/UpdateDisponibilidadUseCase'

export class DisponibilidadAppService {
  private readonly addSegmentoTiempoUseCase: AddSegmentoTiempoUseCase
  private readonly createDisponibilidadUseCase: CreateDisponibilidadUseCase
  private readonly updateDisponibilidadUseCase: UpdateDisponibilidadUseCase
  private readonly listDisponibilidadesByWorkspaceUseCase: ListDisponibilidadesByWorkspaceUseCase

  constructor(
    disponibilidadRepository: DisponibilidadRepository,
    projectRepository: ProjectRepository,
    workspaceRepository: WorkspaceRepository,
    unitOfWork: UnitOfWork,
    eventBus: DomainEventBus,
  ) {
    const eventPublisher = new DomainEventPublisher(eventBus)
    this.addSegmentoTiempoUseCase = new AddSegmentoTiempoUseCase(
      disponibilidadRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.createDisponibilidadUseCase = new CreateDisponibilidadUseCase(
      disponibilidadRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.updateDisponibilidadUseCase = new UpdateDisponibilidadUseCase(
      disponibilidadRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.listDisponibilidadesByWorkspaceUseCase =
      new ListDisponibilidadesByWorkspaceUseCase(disponibilidadRepository)
  }

  create(command: CreateDisponibilidadCommand) {
    return this.createDisponibilidadUseCase.execute(command)
  }

  update(command: UpdateDisponibilidadCommand) {
    return this.updateDisponibilidadUseCase.execute(command)
  }

  addSegment(command: AddSegmentoTiempoCommand) {
    return this.addSegmentoTiempoUseCase.execute(command)
  }

  listByProject(projectId: string) {
    return this.listDisponibilidadesByWorkspaceUseCase.execute({ projectId })
  }
}
