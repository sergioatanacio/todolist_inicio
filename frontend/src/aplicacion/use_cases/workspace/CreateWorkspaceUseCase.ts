import { WorkspaceAggregate } from '../../../dominio/entidades/WorkspaceAggregate'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import {
  type CreateWorkspaceCommand,
  validateCreateWorkspaceCommand,
} from '../../commands/workspace/CreateWorkspaceCommand'

export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateWorkspaceCommand) {
    const input = validateCreateWorkspaceCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = WorkspaceAggregate.create(input.ownerUserId, input.name)
      this.workspaceRepository.save(workspace)
      await this.eventPublisher.publishFrom(workspace)
      return workspace
    })
  }
}
