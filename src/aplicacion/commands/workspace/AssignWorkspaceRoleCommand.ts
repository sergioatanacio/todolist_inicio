import { commandValidation } from './WorkspaceCommandValidation'

export type AssignWorkspaceRoleCommand = {
  workspaceId: string
  actorUserId: number
  targetUserId: number
  roleId: string
}

export const validateAssignWorkspaceRoleCommand = (
  command: AssignWorkspaceRoleCommand,
): AssignWorkspaceRoleCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  targetUserId: commandValidation.ensurePositiveInteger(
    command.targetUserId,
    'targetUserId',
  ),
  roleId: commandValidation.normalizeString(command.roleId, 'roleId'),
})
