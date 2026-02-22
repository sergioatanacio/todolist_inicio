import { aiCommandValidation } from './AiCommandValidation'

export type ListTasksDueTomorrowQuery = {
  workspaceId: string
  projectId: string
  actorUserId: number
}

export const validateListTasksDueTomorrowQuery = (
  query: ListTasksDueTomorrowQuery,
): ListTasksDueTomorrowQuery => ({
  workspaceId: aiCommandValidation.normalizeString(query.workspaceId, 'workspaceId'),
  projectId: aiCommandValidation.normalizeString(query.projectId, 'projectId'),
  actorUserId: aiCommandValidation.ensurePositiveInteger(
    query.actorUserId,
    'actorUserId',
  ),
})
