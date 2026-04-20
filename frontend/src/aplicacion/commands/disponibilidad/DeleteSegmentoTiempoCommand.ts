import { commandValidation } from '../workspace/WorkspaceCommandValidation'

export type DeleteSegmentoTiempoCommand = {
  projectId: string
  disponibilidadId: string
  segmentId: string
  actorUserId: number
}

export const validateDeleteSegmentoTiempoCommand = (
  command: DeleteSegmentoTiempoCommand,
): DeleteSegmentoTiempoCommand => ({
  projectId: commandValidation.normalizeString(command.projectId, 'projectId'),
  disponibilidadId: commandValidation.normalizeString(
    command.disponibilidadId,
    'disponibilidadId',
  ),
  segmentId: commandValidation.normalizeString(command.segmentId, 'segmentId'),
  actorUserId: commandValidation.ensurePositiveInteger(
    command.actorUserId,
    'actorUserId',
  ),
})
