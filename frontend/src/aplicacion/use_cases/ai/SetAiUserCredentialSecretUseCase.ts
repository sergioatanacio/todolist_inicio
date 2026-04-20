import { domainError } from '../../../dominio/errores/DomainError'
import type { AiCredentialSecretStore } from '../../../dominio/puertos/AiCredentialSecretStore'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiCredentialAuthorizationPolicy } from '../../../dominio/servicios/AiCredentialAuthorizationPolicy'
import {
  type SetAiUserCredentialSecretCommand,
  validateSetAiUserCredentialSecretCommand,
} from '../../commands/ai/SetAiUserCredentialSecretCommand'

export class SetAiUserCredentialSecretUseCase {
  constructor(
    private readonly credentialRepository: AiUserCredentialRepository,
    private readonly secretStore: AiCredentialSecretStore,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: SetAiUserCredentialSecretCommand) {
    const input = validateSetAiUserCredentialSecretCommand(command)
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
      const credential = this.credentialRepository.findByWorkspaceAndUser(
        input.workspaceId,
        input.userId,
      )
      if (!credential || credential.state !== 'ACTIVE') {
        throw domainError('FORBIDDEN', 'No existe credencial IA activa para el usuario')
      }

      this.secretStore.put({
        workspaceId: credential.workspaceId,
        userId: credential.userId,
        provider: credential.provider,
        credentialRef: credential.credentialRef,
        secret: input.secret,
      })

      return { workspaceId: credential.workspaceId, userId: credential.userId }
    })
  }
}
