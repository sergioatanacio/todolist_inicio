import { domainError } from '../../../dominio/errores/DomainError'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import {
  type TransferWorkspaceOwnershipCommand,
  validateTransferWorkspaceOwnershipCommand,
} from '../../commands/workspace/TransferWorkspaceOwnershipCommand'

export class TransferWorkspaceOwnershipUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: TransferWorkspaceOwnershipCommand) {
    const input = validateTransferWorkspaceOwnershipCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      const updated = workspace.transferOwnership(
        input.actorUserId,
        input.nextOwnerUserId,
      )
      this.workspaceRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
