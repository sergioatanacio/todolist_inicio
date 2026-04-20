import { domainError } from '../errores/DomainError'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'

export class AiCredentialAuthorizationPolicy {
  static ensureActiveMember(
    workspace: WorkspaceAggregate,
    userId: number,
    message = 'El usuario objetivo no es miembro activo del workspace',
  ) {
    if (!workspace.members.some((member) => member.userId === userId && member.active)) {
      throw domainError('FORBIDDEN', message)
    }
  }

  static ensureCanManageCredential(
    workspace: WorkspaceAggregate,
    actorUserId: number,
    targetUserId: number,
    message = 'No tiene permisos para gestionar esta credencial',
  ) {
    if (actorUserId === targetUserId) return
    if (!workspace.hasPermission(actorUserId, 'workspace.members.manage')) {
      throw domainError('FORBIDDEN', message)
    }
  }
}

