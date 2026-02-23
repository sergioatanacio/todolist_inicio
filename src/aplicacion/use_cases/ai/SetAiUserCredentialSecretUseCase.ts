import { domainError } from '../../../dominio/errores/DomainError'
import type { AiCredentialSecretStore } from '../../../dominio/puertos/AiCredentialSecretStore'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import {
  type SetAiUserCredentialSecretCommand,
  validateSetAiUserCredentialSecretCommand,
} from '../../commands/ai/SetAiUserCredentialSecretCommand'

const canManageCredential = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, actorUserId: number, targetUserId: number) => {
  if (actorUserId === targetUserId) return true
  return workspace.hasPermission(actorUserId, 'workspace.members.manage')
}

const ensureActiveMember = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, userId: number) => {
  if (!workspace.members.some((member) => member.userId === userId && member.active)) {
    throw domainError('FORBIDDEN', 'El usuario objetivo no es miembro activo del workspace')
  }
}

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
      ensureActiveMember(workspace, input.userId)
      ensureActiveMember(workspace, input.actorUserId)
      if (!canManageCredential(workspace, input.actorUserId, input.userId)) {
        throw domainError('FORBIDDEN', 'No tiene permisos para gestionar esta credencial')
      }
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
