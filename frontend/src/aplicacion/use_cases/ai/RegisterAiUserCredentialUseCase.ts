import { domainError } from '../../../dominio/errores/DomainError'
import { AiUserCredentialAggregate } from '../../../dominio/entidades/AiUserCredentialAggregate'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiCredentialAuthorizationPolicy } from '../../../dominio/servicios/AiCredentialAuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type RegisterAiUserCredentialCommand,
  validateRegisterAiUserCredentialCommand,
} from '../../commands/ai/RegisterAiUserCredentialCommand'

export class RegisterAiUserCredentialUseCase {
  constructor(
    private readonly credentialRepository: AiUserCredentialRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: RegisterAiUserCredentialCommand) {
    const input = validateRegisterAiUserCredentialCommand(command)
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
      if (existing) {
        throw domainError('CONFLICT', 'Ya existe credencial IA para este usuario en el workspace')
      }
      const credential = AiUserCredentialAggregate.register({
        workspaceId: input.workspaceId,
        userId: input.userId,
        provider: input.provider,
        credentialRef: input.credentialRef,
        actorUserId: input.actorUserId,
      })
      this.credentialRepository.save(credential)
      await this.eventPublisher.publishFrom(credential)
      return credential
    })
  }
}
