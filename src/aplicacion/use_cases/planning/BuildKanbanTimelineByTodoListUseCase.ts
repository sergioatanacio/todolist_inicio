import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { TaskAggregate } from '../../../dominio/entidades/TaskAggregate'

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

type TimelineRow = {
  rowId: string
  startAt: number
  endAt: number
  segmentId: string | null
  segmentName: string | null
  segmentLabel: string | null
}

type TimelineScheduledItem = {
  taskId: string
  title: string
  durationMinutes: number
  status: 'PENDING' | 'IN_PROGRESS'
  rowStart: number
  rowSpan: number
  segmentId: string | null
  segmentName: string | null
  startsAt: number
  endsAt: number
  orderInList: number
}

type TimelineArchivedItem = {
  taskId: string
  title: string
  durationMinutes: number
  status: 'DONE' | 'ABANDONED'
  orderInList: number
}

export type BuildKanbanTimelineByTodoListResult = {
  disponibilidadId: string
  todoListId: string
  timezone: string
  slotMinutes: number
  windowStart: number
  windowEnd: number
  rows: TimelineRow[]
  pendingItems: TimelineScheduledItem[]
  progressItems: TimelineScheduledItem[]
  doneItems: TimelineArchivedItem[]
  abandonedItems: TimelineArchivedItem[]
}

type BuildKanbanTimelineByTodoListInput = {
  todoListId: string
  slotMinutes?: number
}

type SegmentOccurrence = {
  segmentId: string
  segmentName: string
  startMs: number
  endMs: number
  dayIso: string
  startTime: string
  endTime: string
}

const parseIsoDate = (raw: string): Date => {
  const parsed = new Date(`${raw}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date')
  }
  return parsed
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const dayOfWeekToDomain = (date: Date) => {
  const raw = date.getUTCDay()
  return raw === 0 ? 7 : raw
}

const parseTimeToMinutes = (time: string) => {
  const [hoursRaw, minutesRaw] = time.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    throw new Error('Invalid time')
  }
  return hours * 60 + minutes
}

const clampSlotMinutes = (value: number | undefined) => {
  if (!Number.isFinite(value)) return 5
  const normalized = Math.floor(Number(value))
  return Math.max(5, normalized)
}

const toSegmentLabel = (occurrence: SegmentOccurrence) =>
  `${occurrence.segmentName} | ${occurrence.dayIso} ${occurrence.startTime}-${occurrence.endTime}`

const hasOverlap = (
  a: { startMs: number; endMs: number },
  b: { startMs: number; endMs: number },
) => a.startMs < b.endMs && b.startMs < a.endMs

const createScheduledItem = (
  task: TaskAggregate & { status: 'PENDING' | 'IN_PROGRESS' },
  rowStart: number,
  rowSpan: number,
  rows: TimelineRow[],
): TimelineScheduledItem => {
  const firstRow = rows[rowStart]
  const lastRow = rows[rowStart + rowSpan - 1]
  return {
    taskId: task.id,
    title: task.title,
    durationMinutes: task.durationMinutes,
    status: task.status,
    rowStart,
    rowSpan,
    segmentId: firstRow?.segmentId ?? null,
    segmentName: firstRow?.segmentName ?? null,
    startsAt: firstRow?.startAt ?? 0,
    endsAt: lastRow?.endAt ?? 0,
    orderInList: task.orderInList,
  }
}

export class BuildKanbanTimelineByTodoListUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly disponibilidadRepository: DisponibilidadRepository,
  ) {}

  execute(
    input: BuildKanbanTimelineByTodoListInput,
  ): BuildKanbanTimelineByTodoListResult {
    const slotMinutes = clampSlotMinutes(input.slotMinutes)
    const slotMs = slotMinutes * MINUTE_MS

    const todoList = this.todoListRepository.findById(input.todoListId)
    if (!todoList) {
      throw new Error('Lista no encontrada para timeline de Kanban')
    }
    const disponibilidad = this.disponibilidadRepository.findById(todoList.disponibilidadId)
    if (!disponibilidad) {
      throw new Error('Disponibilidad no encontrada para timeline de Kanban')
    }

    const windowStart = parseIsoDate(disponibilidad.startDate).getTime()
    const windowEnd = parseIsoDate(disponibilidad.endDate).getTime() + DAY_MS

    const occurrences: SegmentOccurrence[] = []
    for (const segment of disponibilidad.segments) {
      const specificDates = new Set(segment.specificDates)
      const exclusionDates = new Set(segment.exclusionDates)
      const daysOfWeek = new Set(segment.daysOfWeek)
      const daysOfMonth = new Set(segment.daysOfMonth)

      const appliesTo = (baseDate: Date) => {
        const iso = toIsoDate(baseDate)
        if (exclusionDates.has(iso)) return false
        return (
          specificDates.has(iso) ||
          daysOfWeek.has(dayOfWeekToDomain(baseDate)) ||
          daysOfMonth.has(baseDate.getUTCDate())
        )
      }

      const startMinutes = parseTimeToMinutes(segment.startTime)
      const endMinutes = parseTimeToMinutes(segment.endTime)
      const crossesMidnight = endMinutes <= startMinutes

      for (
        let cursor = new Date(windowStart - DAY_MS);
        cursor.getTime() <= windowEnd;
        cursor = new Date(cursor.getTime() + DAY_MS)
      ) {
        if (!appliesTo(cursor)) continue

        const baseDayStart = Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
          0,
          0,
          0,
          0,
        )

        const first = {
          startMs: baseDayStart + startMinutes * MINUTE_MS,
          endMs: baseDayStart + (crossesMidnight ? 24 * 60 : endMinutes) * MINUTE_MS,
        }
        const clippedFirst = {
          startMs: Math.max(first.startMs, windowStart),
          endMs: Math.min(first.endMs, windowEnd),
        }
        if (clippedFirst.startMs < clippedFirst.endMs) {
          occurrences.push({
            segmentId: segment.id,
            segmentName: segment.name,
            startTime: segment.startTime,
            endTime: segment.endTime,
            dayIso: toIsoDate(cursor),
            ...clippedFirst,
          })
        }

        if (!crossesMidnight) continue

        const nextDay = new Date(cursor.getTime() + DAY_MS)
        const nextDayIso = toIsoDate(nextDay)
        if (exclusionDates.has(nextDayIso)) continue

        const second = {
          startMs: baseDayStart + DAY_MS,
          endMs: baseDayStart + DAY_MS + endMinutes * MINUTE_MS,
        }
        const clippedSecond = {
          startMs: Math.max(second.startMs, windowStart),
          endMs: Math.min(second.endMs, windowEnd),
        }
        if (clippedSecond.startMs < clippedSecond.endMs) {
          occurrences.push({
            segmentId: segment.id,
            segmentName: segment.name,
            startTime: segment.startTime,
            endTime: segment.endTime,
            dayIso: nextDayIso,
            ...clippedSecond,
          })
        }
      }
    }

    occurrences.sort((a, b) => a.startMs - b.startMs)

    const mergedAvailability = disponibilidad.calcularIntervalosValidos()
    const rows: TimelineRow[] = []

    for (const interval of mergedAvailability) {
      for (let slotStart = interval.startMs; slotStart < interval.endMs; slotStart += slotMs) {
        const slotEnd = Math.min(slotStart + slotMs, interval.endMs)
        const active = occurrences.filter((item) =>
          hasOverlap(item, { startMs: slotStart, endMs: slotEnd }),
        )
        const labels = [...new Set(active.map((item) => item.segmentName))]

        rows.push({
          rowId: String(slotStart),
          startAt: slotStart,
          endAt: slotEnd,
          segmentId: active.length === 1 ? active[0].segmentId : null,
          segmentName: active.length === 1 ? active[0].segmentName : labels[0] ?? null,
          segmentLabel: active.length === 1 ? toSegmentLabel(active[0]) : labels.join(' + ') || null,
        })
      }
    }

    const orderedTasks = this.taskRepository
      .findByTodoListId(input.todoListId)
      .sort((a, b) => a.orderInList - b.orderInList)

    const schedulable = orderedTasks.filter(
      (
        task,
      ): task is TaskAggregate & {
        status: 'PENDING' | 'IN_PROGRESS'
      } => task.status === 'PENDING' || task.status === 'IN_PROGRESS',
    )

    const pendingItems: TimelineScheduledItem[] = []
    const progressItems: TimelineScheduledItem[] = []
    let rowCursor = 0

    for (const task of schedulable) {
      if (rowCursor >= rows.length) break
      const requiredRows = Math.max(1, Math.ceil(task.durationMinutes / slotMinutes))
      const rowSpan = Math.min(requiredRows, rows.length - rowCursor)
      const item = createScheduledItem(task, rowCursor, rowSpan, rows)
      if (task.status === 'PENDING') pendingItems.push(item)
      if (task.status === 'IN_PROGRESS') progressItems.push(item)
      rowCursor += rowSpan
    }

    const doneItems: TimelineArchivedItem[] = orderedTasks
      .filter((task): task is TaskAggregate & { status: 'DONE' } => task.status === 'DONE')
      .map((task) => ({
        taskId: task.id,
        title: task.title,
        durationMinutes: task.durationMinutes,
        status: task.status,
        orderInList: task.orderInList,
      }))

    const abandonedItems: TimelineArchivedItem[] = orderedTasks
      .filter(
        (task): task is TaskAggregate & { status: 'ABANDONED' } =>
          task.status === 'ABANDONED',
      )
      .map((task) => ({
        taskId: task.id,
        title: task.title,
        durationMinutes: task.durationMinutes,
        status: task.status,
        orderInList: task.orderInList,
      }))

    return {
      disponibilidadId: disponibilidad.id,
      todoListId: todoList.id,
      timezone: 'UTC',
      slotMinutes,
      windowStart,
      windowEnd,
      rows,
      pendingItems,
      progressItems,
      doneItems,
      abandonedItems,
    }
  }
}
