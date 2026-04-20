import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type ToggleTaskDoneCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  taskId: string
}

export const validateToggleTaskDoneCommand = (
  command: ToggleTaskDoneCommand,
): ToggleTaskDoneCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  taskId: commandValidation.normalizeString(command.taskId, 'taskId'),
})
