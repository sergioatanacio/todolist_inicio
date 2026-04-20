import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import type { TaskPlanningAppService } from '../../TaskPlanningAppService'
import {
  type ListTasksDueTomorrowQuery,
  validateListTasksDueTomorrowQuery,
} from '../../commands/ai/ListTasksDueTomorrowQuery'

const tomorrowIsoUtc = (nowMs: number) => {
  const date = new Date(nowMs)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

export type TasksDueTomorrowItem = {
  taskId: string
  taskTitle: string
  todoListId: string
  todoListName: string
  firstScheduledStart: number
  totalMinutesPlannedTomorrow: number
}

export class ListTasksDueTomorrowUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly taskPlanningAppService: TaskPlanningAppService,
  ) {}

  execute(query: ListTasksDueTomorrowQuery) {
    const input = validateListTasksDueTomorrowQuery(query)
    const workspace = this.workspaceRepository.findById(input.workspaceId)
    const project = this.projectRepository.findById(input.projectId)
    if (!workspace || !project) throw domainError('NOT_FOUND', 'Contexto no encontrado')
    ContextIntegrityPolicy.ensureProjectInWorkspace(
      workspace,
      project,
      'Proyecto fuera de workspace',
    )
    if (
      !AuthorizationPolicy.canInProject({
        workspace,
        project,
        actorUserId: input.actorUserId,
        permission: 'project.view',
      })
    ) {
      throw domainError('FORBIDDEN', 'No tienes permisos para consultar calendario')
    }
    const calendar = this.taskPlanningAppService.buildProjectCalendarDetailed(
      input.projectId,
      Date.now(),
    )
    const dueDay = tomorrowIsoUtc(Date.now())
    const blocks = calendar.plannedBlocks.filter(
      (block) => new Date(block.scheduledStart).toISOString().slice(0, 10) === dueDay,
    )
    const byTask = new Map<string, TasksDueTomorrowItem>()
    for (const block of blocks) {
      const existing = byTask.get(block.taskId)
      if (!existing) {
        byTask.set(block.taskId, {
          taskId: block.taskId,
          taskTitle: block.taskTitle,
          todoListId: block.todoListId,
          todoListName: block.todoListName,
          firstScheduledStart: block.scheduledStart,
          totalMinutesPlannedTomorrow: block.durationMinutes,
        })
      } else {
        existing.firstScheduledStart = Math.min(existing.firstScheduledStart, block.scheduledStart)
        existing.totalMinutesPlannedTomorrow += block.durationMinutes
      }
    }
    return [...byTask.values()].sort(
      (a, b) => a.firstScheduledStart - b.firstScheduledStart,
    )
  }
}
