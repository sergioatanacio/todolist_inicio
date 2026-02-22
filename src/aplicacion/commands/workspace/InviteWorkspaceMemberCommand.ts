import { commandValidation } from './WorkspaceCommandValidation'

export type InviteWorkspaceMemberCommand = {
  workspaceId: string
  actorUserId: number
  targetUserId: number
}

export const validateInviteWorkspaceMemberCommand = (
  command: InviteWorkspaceMemberCommand,
): InviteWorkspaceMemberCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  targetUserId: commandValidation.ensurePositiveInteger(
    command.targetUserId,
    'targetUserId',
  ),
})
