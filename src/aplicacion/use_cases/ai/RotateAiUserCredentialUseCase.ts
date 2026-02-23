import { domainError } from '../../../dominio/errores/DomainError'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type RotateAiUserCredentialCommand,
  validateRotateAiUserCredentialCommand,
} from '../../commands/ai/RotateAiUserCredentialCommand'

const canManageCredential = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, actorUserId: number, targetUserId: number) => {
  if (actorUserId === targetUserId) return true
  return workspace.hasPermission(actorUserId, 'workspace.members.manage')
}

const ensureActiveMember = (workspace: NonNullable<ReturnType<WorkspaceRepository['findById']>>, userId: number) => {
  if (!workspace.members.some((member) => member.userId === userId && member.active)) {
    throw domainError('FORBIDDEN', 'El usuario objetivo no es miembro activo del workspace')
  }
}

export class RotateAiUserCredentialUseCase {
  constructor(
    private readonly credentialRepository: AiUserCredentialRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: RotateAiUserCredentialCommand) {
    const input = validateRotateAiUserCredentialCommand(command)
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
      if (!existing) {
        throw domainError('NOT_FOUND', 'Credencial IA no encontrada para el usuario')
      }
      const updated = existing.rotate(input.actorUserId, input.credentialRef)
      this.credentialRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
