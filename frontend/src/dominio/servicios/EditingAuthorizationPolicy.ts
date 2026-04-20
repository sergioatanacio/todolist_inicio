import { domainError } from '../errores/DomainError'
import { ProjectAggregate } from '../entidades/ProjectAggregate'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'
import { AuthorizationPolicy } from './AuthorizationPolicy'

export class EditingAuthorizationPolicy {
  static ensureWorkspaceEditable(
    workspace: WorkspaceAggregate,
    actorUserId: number,
    message = 'No tienes permisos para editar el workspace',
  ) {
    if (
      !AuthorizationPolicy.canInWorkspace(
        workspace,
        actorUserId,
        'workspace.members.manage',
      )
    ) {
      throw domainError('FORBIDDEN', message)
    }
  }

  static ensureProjectEditable(
    workspace: WorkspaceAggregate,
    project: ProjectAggregate,
    actorUserId: number,
    message = 'No tienes permisos para editar proyectos',
  ) {
    if (
      !AuthorizationPolicy.canInProject({
        workspace,
        project,
        actorUserId,
        permission: 'project.access.manage',
      })
    ) {
      throw domainError('FORBIDDEN', message)
    }
  }

  static ensureDisponibilidadEditable(
    workspace: WorkspaceAggregate,
    project: ProjectAggregate,
    actorUserId: number,
    message = 'No tienes permisos para modificar disponibilidades',
  ) {
    if (
      !AuthorizationPolicy.canInProject({
        workspace,
        project,
        actorUserId,
        permission: 'project.availability.create',
      })
    ) {
      throw domainError('FORBIDDEN', message)
    }
  }

  static ensureTodoListEditable(
    workspace: WorkspaceAggregate,
    project: ProjectAggregate,
    actorUserId: number,
    message = 'No tienes permisos para editar listas',
  ) {
    if (
      !AuthorizationPolicy.canInProject({
        workspace,
        project,
        actorUserId,
        permission: 'project.todolists.create',
      })
    ) {
      throw domainError('FORBIDDEN', message)
    }
  }
}

