import { domainError } from '../../../dominio/errores/DomainError'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiCredentialAuthorizationPolicy } from '../../../dominio/servicios/AiCredentialAuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type RevokeAiUserCredentialCommand,
  validateRevokeAiUserCredentialCommand,
} from '../../commands/ai/RevokeAiUserCredentialCommand'

export class RevokeAiUserCredentialUseCase {
  constructor(
    private readonly credentialRepository: AiUserCredentialRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: RevokeAiUserCredentialCommand) {
    const input = validateRevokeAiUserCredentialCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) throw domainError('NOT_FOUND', 'Workspace no encontrado')
      AiCredentialAuthorizationPolicy.ensureActiveMember(workspace, input.userId)
      AiCredentialAuthorizationPolicy.ensureActiveMember(
        workspace,
        input.actorUserId,
        'El actor no es miembro activo del workspace',
      )
      AiCredentialAuthorizationPolicy.ensureCanManageCredential(
        workspace,
        input.actorUserId,
        input.userId,
      )
      const existing = this.credentialRepository.findByWorkspaceAndUser(
        input.workspaceId,
        input.userId,
      )
      if (!existing) {
        throw domainError('NOT_FOUND', 'Credencial IA no encontrada para el usuario')
      }
      const updated = existing.revoke(input.actorUserId)
      this.credentialRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
