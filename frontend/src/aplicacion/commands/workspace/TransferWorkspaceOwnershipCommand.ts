import { commandValidation } from './WorkspaceCommandValidation'

export type TransferWorkspaceOwnershipCommand = {
  workspaceId: string
  actorUserId: number
  nextOwnerUserId: number
}

export const validateTransferWorkspaceOwnershipCommand = (
  command: TransferWorkspaceOwnershipCommand,
): TransferWorkspaceOwnershipCommand => ({
  workspaceId: commandValidation.normalizeString(command.workspaceId, 'workspaceId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  nextOwnerUserId: commandValidation.ensurePositiveInteger(
    command.nextOwnerUserId,
    'nextOwnerUserId',
  ),
})
