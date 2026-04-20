import { commandValidation } from '../workspace/WorkspaceCommandValidation'

const normalizeNumberArray = (values: number[] | undefined): number[] => {
  if (!values) return []
  return values.map((value, index) =>
    commandValidation.ensurePositiveInteger(value, `numberList[${index}]`),
  )
}

const normalizeStringArray = (values: string[] | undefined, field: string): string[] => {
  if (!values) return []
  return values.map((value, index) =>
    commandValidation.normalizeString(value, `${field}[${index}]`),
  )
}

export type AddSegmentoTiempoCommand = {
  projectId: string
  disponibilidadId: string
  actorUserId: number
  name: string
  description: string
  startTime: string
  endTime: string
  specificDates?: string[]
  exclusionDates?: string[]
  daysOfWeek?: number[]
  daysOfMonth?: number[]
}

export const validateAddSegmentoTiempoCommand = (
  command: AddSegmentoTiempoCommand,
): AddSegmentoTiempoCommand => ({
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
  startTime: commandValidation.normalizeString(command.startTime, 'startTime'),
  endTime: commandValidation.normalizeString(command.endTime, 'endTime'),
  specificDates: normalizeStringArray(command.specificDates, 'specificDates'),
  exclusionDates: normalizeStringArray(command.exclusionDates, 'exclusionDates'),
  daysOfWeek: normalizeNumberArray(command.daysOfWeek),
  daysOfMonth: normalizeNumberArray(command.daysOfMonth),
})
