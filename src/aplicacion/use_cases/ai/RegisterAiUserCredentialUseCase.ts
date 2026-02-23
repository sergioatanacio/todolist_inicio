import { domainError } from '../../../dominio/errores/DomainError'
import { AiUserCredentialAggregate } from '../../../dominio/entidades/AiUserCredentialAggregate'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type RegisterAiUserCredentialCommand,
  validateRegisterAiUserCredentialCommand,
} from '../../commands/ai/RegisterAiUserCredentialCommand'

const canManageCredential = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, actorUserId: number, targetUserId: number) => {
  if (actorUserId === targetUserId) return true
  return workspace.hasPermission(actorUserId, 'workspace.members.manage')
}

const ensureActiveMember = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, userId: number) => {
  if (!workspace.members.some((member) => member.userId === userId && member.active)) {
    throw domainError('FORBIDDEN', 'El usuario objetivo no es miembro activo del workspace')
  }
}

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
      ensureActiveMember(workspace, input.userId)
      ensureActiveMember(workspace, input.actorUserId)
      if (!canManageCredential(workspace, input.actorUserId, input.userId)) {
        throw domainError('FORBIDDEN', 'No tiene permisos para gestionar esta credencial')
      }
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
