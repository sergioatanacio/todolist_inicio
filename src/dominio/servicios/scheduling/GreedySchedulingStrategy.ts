import type { TaskAggregate } from '../../entidades/TaskAggregate'
import type { SchedulingStrategy } from './SchedulingStrategy'
import type {
  ScheduledTaskBlock,
  SchedulingInput,
  SchedulingResult,
} from './SchedulingTypes'

const MINUTE_MS = 60 * 1000

const toIsoDateUtc = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10)

const truncateToMinute = (timestamp: number) =>
  Math.floor(timestamp / MINUTE_MS) * MINUTE_MS

const isSchedulableStatus = (status: TaskAggregate['status']) =>
  status === 'PENDING' || status === 'IN_PROGRESS'

export class GreedySchedulingStrategy implements SchedulingStrategy {
  buildPlan(input: SchedulingInput): SchedulingResult {
    const { disponibilidad } = input
    const lists = input.todoLists
      .filter((list) => list.disponibilidadId === disponibilidad.id)
      .sort((a, b) => a.orderInDisponibilidad - b.orderInDisponibilidad)

    const tasksByList = new Map<string, TaskAggregate[]>()
    for (const task of input.tasks.filter((item) => isSchedulableStatus(item.status))) {
      const existing = tasksByList.get(task.todoListId) ?? []
      existing.push(task)
      tasksByList.set(task.todoListId, existing)
    }
    for (const [listId, items] of tasksByList.entries()) {
      const ordered = items.sort((a, b) => a.orderInList - b.orderInList)
      tasksByList.set(listId, ordered)
    }

    const intervals = disponibilidad.calcularIntervalosValidos()
    const plannedBlocks: ScheduledTaskBlock[] = []
    const unplannedTaskIds: string[] = []
    const nowMs = truncateToMinute(input.options?.nowMs ?? Date.now())

    const clippedIntervals = intervals
      .map((interval) => ({
        startMs: Math.max(interval.startMs, nowMs),
        endMs: interval.endMs,
      }))
      .filter((interval) => interval.startMs < interval.endMs)

    let intervalIndex = 0
    let cursor =
      clippedIntervals.length > 0
        ? clippedIntervals[0].startMs
        : Number.POSITIVE_INFINITY

    const moveCursorToNextAvailable = () => {
      while (intervalIndex < clippedIntervals.length) {
        const current = clippedIntervals[intervalIndex]
        if (cursor < current.startMs) {
          cursor = current.startMs
        }
        if (cursor < current.endMs) {
          return true
        }
        intervalIndex += 1
        if (intervalIndex < clippedIntervals.length) {
          cursor = clippedIntervals[intervalIndex].startMs
        }
      }
      return false
    }

    const inProgressQueue = lists.flatMap((list) =>
      (tasksByList.get(list.id) ?? [])
        .filter((task) => task.status === 'IN_PROGRESS')
        .sort((a, b) => a.orderInList - b.orderInList)
        .map((task) => ({ list, task })),
    )
    const pendingQueue = lists.flatMap((list) =>
      (tasksByList.get(list.id) ?? [])
        .filter((task) => task.status === 'PENDING')
        .sort((a, b) => a.orderInList - b.orderInList)
        .map((task) => ({ list, task })),
    )
    const taskQueue = [...inProgressQueue, ...pendingQueue]

    const dayBlockCounts = new Map<string, number>()

    const addPlannedBlock = (
      task: TaskAggregate,
      listId: string,
      start: number,
      end: number,
    ) => {
      const blockDurationMinutes = Math.floor((end - start) / MINUTE_MS)
      if (blockDurationMinutes <= 0) return
      plannedBlocks.push({
        taskId: task.id,
        todoListId: listId,
        disponibilidadId: disponibilidad.id,
        scheduledStart: start,
        scheduledEnd: end,
        durationMinutes: blockDurationMinutes,
      })
      const day = toIsoDateUtc(start)
      dayBlockCounts.set(day, (dayBlockCounts.get(day) ?? 0) + 1)
    }

    for (const { list, task } of taskQueue) {
      let remainingMs = task.durationMinutes * MINUTE_MS
      if (remainingMs <= 0) continue

      while (remainingMs > 0) {
        if (!moveCursorToNextAvailable()) {
          unplannedTaskIds.push(task.id)
          break
        }
        const current = clippedIntervals[intervalIndex]
        const availableMs = current.endMs - cursor
        const consumedMs = Math.min(remainingMs, availableMs)
        const start = cursor
        const end = cursor + consumedMs
        addPlannedBlock(task, list.id, start, end)
        cursor = end
        remainingMs -= consumedMs
      }
    }

    const tasksPerDay: Record<string, number> = {}
    for (const [day, blockCount] of dayBlockCounts.entries()) {
      tasksPerDay[day] = blockCount
    }

    return { plannedBlocks, unplannedTaskIds, tasksPerDay }
  }
}
