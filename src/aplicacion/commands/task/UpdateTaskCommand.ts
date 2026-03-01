import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type UpdateTaskCommand = {
  workspaceId: string
  projectId: string
  actorUserId: number
  taskId: string
  title: string
  durationMinutes: number
}

export const validateUpdateTaskCommand = (
  command: UpdateTaskCommand,
): UpdateTaskCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  taskId: commandValidation.normalizeString(command.taskId, 'taskId'),
  title: commandValidation.normalizeString(command.title, 'title'),
  durationMinutes: commandValidation.ensurePositiveInteger(
    command.durationMinutes,
    'durationMinutes',
  ),
})

