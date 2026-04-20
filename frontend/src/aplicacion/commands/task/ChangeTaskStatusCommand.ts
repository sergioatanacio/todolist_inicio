import type { TaskStatus } from '../../../dominio/valores_objeto/TaskStatus'
import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type ChangeTaskStatusCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  taskId: string
  toStatus: TaskStatus
}

export const validateChangeTaskStatusCommand = (
  command: ChangeTaskStatusCommand,
): ChangeTaskStatusCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  taskId: commandValidation.normalizeString(command.taskId, 'taskId'),
  toStatus: command.toStatus,
})
