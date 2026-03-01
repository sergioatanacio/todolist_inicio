import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type UpdateDisponibilidadCommand = {
  projectId: string
  disponibilidadId: string
  actorUserId: number
  name: string
  description: string
  startDate: string
  endDate: string
}

export const validateUpdateDisponibilidadCommand = (
  command: UpdateDisponibilidadCommand,
): UpdateDisponibilidadCommand => ({
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  disponibilidadId: commandValidation.normalizeString(
    command.disponibilidadId,
    'disponibilidadId',
  ),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
  name: commandValidation.normalizeString(command.name, 'name'),
  description: command.description.trim(),
  startDate: commandValidation.normalizeString(command.startDate, 'startDate'),
  endDate: commandValidation.normalizeString(command.endDate, 'endDate'),
})

