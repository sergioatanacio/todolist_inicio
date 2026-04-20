import { commandValidation } from './WorkspaceCommandValidation'

export type CreateWorkspaceCommand = {
  ownerUserId: number
  name: string
}

export const validateCreateWorkspaceCommand = (
  command: CreateWorkspaceCommand,
): CreateWorkspaceCommand => ({
  ownerUserId: commandValidation.ensurePositiveInteger(
    command.ownerUserId,
    'ownerUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
})
