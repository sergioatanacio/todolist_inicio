import { ProjectAggregate } from '../entidades/ProjectAggregate'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'
import type { Permission } from '../valores_objeto/Permission'

export class AuthorizationPolicy {
  static canInWorkspace(
    workspace: WorkspaceAggregate,
    actorUserId: number,
    permission: Permission,
  ) {
    return workspace.hasPermission(actorUserId, permission)
  }

  static canInProject(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
    permission: Permission
  }) {
    if (data.project.workspaceId !== data.workspace.id) return false

    const workspaceAllowed = data.workspace.hasPermission(
      data.actorUserId,
      data.permission,
    )
    const projectAllowed = data.project.hasPermission(
      data.actorUserId,
      data.permission,
    )
    if (workspaceAllowed && data.project.hasAccess(data.actorUserId)) {
      return true
    }
    return projectAllowed
  }

  static canCreateTask(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.create',
    })
  }

  static canUpdateTask(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.update',
    })
  }

  static canAssignTask(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.assign',
    })
  }

  static canChangeTaskStatus(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.status.update',
    })
  }

  static canToggleTaskDone(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.status.toggle_done',
    })
  }

  static canCommentTask(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.comment.add',
    })
  }

  static canModerateTaskComments(data: {
    workspace: WorkspaceAggregate
    project: ProjectAggregate
    actorUserId: number
  }) {
    return this.canInProject({
      ...data,
      permission: 'task.comment.moderate',
    })
  }

  static canChatWithAnyWorkspaceMember(
    workspace: WorkspaceAggregate,
    actorUserId: number,
  ) {
    return workspace.hasPermission(actorUserId, 'workspace.chat.all_members')
  }

  static canChatWithSharedProjectMembers(data: {
    workspace: WorkspaceAggregate
    projects: ProjectAggregate[]
    actorUserId: number
    targetUserId: number
  }) {
    const hasLimitedChatPermission = data.workspace.hasPermission(
      data.actorUserId,
      'workspace.chat.project_members_only',
    )
    if (!hasLimitedChatPermission) return false
    return data.projects.some(
      (project) =>
        project.workspaceId === data.workspace.id &&
        project.hasAccess(data.actorUserId) &&
        project.hasAccess(data.targetUserId),
    )
  }
}
