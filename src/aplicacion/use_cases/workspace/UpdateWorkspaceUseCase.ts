import { domainError } from '../../../dominio/errores/DomainError'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { EditingAuthorizationPolicy } from '../../../dominio/servicios/EditingAuthorizationPolicy'
import {
  type UpdateWorkspaceCommand,
  validateUpdateWorkspaceCommand,
} from '../../commands/workspace/UpdateWorkspaceCommand'

export class UpdateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateWorkspaceCommand) {
    const input = validateUpdateWorkspaceCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      EditingAuthorizationPolicy.ensureWorkspaceEditable(
        workspace,
        input.actorUserId,
      )

      const nextWorkspace = workspace.rename(input.name)
      this.workspaceRepository.save(nextWorkspace)
      await this.eventPublisher.publishFrom(nextWorkspace)
      return nextWorkspace
    })
  }
}

