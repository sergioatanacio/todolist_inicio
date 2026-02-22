import type { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate'
import type { TaskAggregate } from '../entidades/TaskAggregate'
import type { TodoListAggregate } from '../entidades/TodoListAggregate'
import { domainError } from '../errores/DomainError'

export type ScheduledTaskBlock = {
  taskId: string
  todoListId: string
  disponibilidadId: string
  scheduledStart: number
  scheduledEnd: number
  durationMinutes: number
}

export type SchedulingResult = {
  plannedBlocks: ScheduledTaskBlock[]
  unplannedTaskIds: string[]
  tasksPerDay: Record<string, number>
}

const toIsoDateUtc = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10)

export class SchedulingPolicy {
  buildPlan(input: {
    disponibilidad: DisponibilidadAggregate
    todoLists: TodoListAggregate[]
    tasks: TaskAggregate[]
  }): SchedulingResult {
    const { disponibilidad } = input
    if (disponibilidad.state !== 'ACTIVE') {
      throw domainError(
        'INVALID_STATE',
        'No se puede planificar con una disponibilidad archivada',
      )
    }

    const lists = input.todoLists
      .filter((list) => list.disponibilidadId === disponibilidad.id)
      .sort((a, b) => a.orderInDisponibilidad - b.orderInDisponibilidad)

    const tasksByList = new Map<string, TaskAggregate[]>()
    for (const task of input.tasks) {
      const existing = tasksByList.get(task.todoListId) ?? []
      existing.push(task)
      tasksByList.set(task.todoListId, existing)
    }
    for (const list of lists) {
      const ordered = (tasksByList.get(list.id) ?? []).sort(
        (a, b) => a.orderInList - b.orderInList,
      )
      tasksByList.set(list.id, ordered)
    }

    const intervals = disponibilidad.calcularIntervalosValidos()
    const plannedBlocks: ScheduledTaskBlock[] = []
    const unplannedTaskIds: string[] = []

    let intervalIndex = 0
    let cursor =
      intervals.length > 0 ? intervals[0].startMs : Number.POSITIVE_INFINITY

    const moveCursorToFit = (durationMs: number) => {
      while (intervalIndex < intervals.length) {
        const current = intervals[intervalIndex]
        if (cursor < current.startMs) cursor = current.startMs
        if (cursor + durationMs <= current.endMs) return true
        intervalIndex += 1
        if (intervalIndex < intervals.length) {
          cursor = intervals[intervalIndex].startMs
        }
      }
      return false
    }

    for (const list of lists) {
      const tasks = tasksByList.get(list.id) ?? []
      for (const task of tasks) {
        const durationMs = task.durationMinutes * 60 * 1000
        if (!moveCursorToFit(durationMs)) {
          unplannedTaskIds.push(task.id)
          continue
        }
        const start = cursor
        const end = cursor + durationMs
        plannedBlocks.push({
          taskId: task.id,
          todoListId: list.id,
          disponibilidadId: disponibilidad.id,
          scheduledStart: start,
          scheduledEnd: end,
          durationMinutes: task.durationMinutes,
        })
        cursor = end
      }
    }

    const tasksPerDay: Record<string, number> = {}
    for (const block of plannedBlocks) {
      const day = toIsoDateUtc(block.scheduledStart)
      tasksPerDay[day] = (tasksPerDay[day] ?? 0) + 1
    }

    return { plannedBlocks, unplannedTaskIds, tasksPerDay }
  }
}
