import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type CreateDisponibilidadCommand = {
  projectId: string
  actorUserId: number
  name: string
  description: string
  startDate: string
  endDate: string
}

export const validateCreateDisponibilidadCommand = (
  command: CreateDisponibilidadCommand,
): CreateDisponibilidadCommand => ({
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
  startDate: commandValidation.normalizeString(command.startDate, 'startDate'),
  endDate: commandValidation.normalizeString(command.endDate, 'endDate'),
})
