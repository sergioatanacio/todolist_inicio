import { ProjectAggregate } from '../entidades/ProjectAggregate'
import { TaskAggregate } from '../entidades/TaskAggregate'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'
import { domainError } from '../errores/DomainError'
import { type TaskStatus } from '../valores_objeto/TaskStatus'
import { AuthorizationPolicy } from './AuthorizationPolicy'

type WorkflowContext = {
  workspace: WorkspaceAggregate
  project: ProjectAggregate
  actorUserId: number
}

export class TaskWorkflowService {
  changeStatus(
    task: TaskAggregate,
    nextStatus: TaskStatus,
    context: WorkflowContext,
  ) {
    if (
      !AuthorizationPolicy.canChangeTaskStatus({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError(
        'FORBIDDEN',
        'El actor no puede cambiar el estado de la tarea',
      )
    }
    return task.changeStatus(context.actorUserId, nextStatus)
  }

  toggleDone(task: TaskAggregate, context: WorkflowContext) {
    if (
      !AuthorizationPolicy.canToggleTaskDone({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError(
        'FORBIDDEN',
        'El actor no puede alternar el estado done de la tarea',
      )
    }
    return task.toggleDone(context.actorUserId)
  }

  addComment(
    task: TaskAggregate,
    body: string,
    context: WorkflowContext,
    parentCommentId?: string,
  ) {
    if (
      !AuthorizationPolicy.canCommentTask({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError('FORBIDDEN', 'El actor no puede comentar en la tarea')
    }
    return task.addComment(context.actorUserId, body, parentCommentId)
  }

  deleteComment(
    task: TaskAggregate,
    commentId: string,
    context: WorkflowContext,
  ) {
    const canModerate = AuthorizationPolicy.canModerateTaskComments({
      workspace: context.workspace,
      project: context.project,
      actorUserId: context.actorUserId,
    })
    return task.deleteComment(context.actorUserId, commentId, canModerate)
  }

  assign(task: TaskAggregate, assigneeUserId: number, context: WorkflowContext) {
    if (
      !AuthorizationPolicy.canAssignTask({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError('FORBIDDEN', 'El actor no puede asignar la tarea')
    }
    return task.assign(context.actorUserId, assigneeUserId)
  }

  updateDuration(task: TaskAggregate, durationMinutes: number, context: WorkflowContext) {
    if (
      !AuthorizationPolicy.canUpdateTask({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError('FORBIDDEN', 'El actor no puede actualizar la tarea')
    }
    return task.changeDuration(context.actorUserId, durationMinutes)
  }

  schedule(
    task: TaskAggregate,
    scheduledStart: number,
    scheduledEnd: number,
    context: WorkflowContext,
  ) {
    if (
      !AuthorizationPolicy.canUpdateTask({
        workspace: context.workspace,
        project: context.project,
        actorUserId: context.actorUserId,
      })
    ) {
      throw domainError('FORBIDDEN', 'El actor no puede planificar la tarea')
    }
    return task.schedule(context.actorUserId, scheduledStart, scheduledEnd)
  }
}
