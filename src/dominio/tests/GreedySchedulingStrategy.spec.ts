import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../entidades/TodoListAggregate.ts'
import { GreedySchedulingStrategy } from '../servicios/scheduling/GreedySchedulingStrategy.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const isoFromNow = (daysOffset: number): string => {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  )
  date.setUTCDate(date.getUTCDate() + daysOffset)
  return date.toISOString().slice(0, 10)
}

const atUtc = (isoDate: string, hour: number, minute: number) =>
  Date.parse(`${isoDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`)

export const greedySchedulingStrategySpec = () => {
  const targetDate = isoFromNow(1)
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: 'p-1',
    name: 'Semana',
    startDate: targetDate,
    endDate: targetDate,
    segments: [
      {
        name: 'Bloque maniana',
        startTime: '09:00',
        endTime: '10:00',
        specificDates: [targetDate],
      },
      {
        name: 'Bloque tarde',
        startTime: '10:30',
        endTime: '11:30',
        specificDates: [targetDate],
      },
    ],
  })

  const listA = TodoListAggregate.create('p-1', disponibilidad.id, 1, 'Lista A', '')
  const listB = TodoListAggregate.create('p-1', disponibilidad.id, 2, 'Lista B', '')

  const taskInProgress = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listB.id,
    title: 'B in progress',
    createdByUserId: 1,
    durationMinutes: 70,
    orderInList: 1,
  }).changeStatus(1, 'IN_PROGRESS')

  const taskPending = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listA.id,
    title: 'A pending',
    createdByUserId: 1,
    durationMinutes: 40,
    orderInList: 1,
  })

  const strategy = new GreedySchedulingStrategy()
  const result = strategy.buildPlan({
    disponibilidad,
    todoLists: [listA, listB],
    tasks: [taskPending, taskInProgress],
    options: { nowMs: atUtc(targetDate, 9, 20) },
  })

  assert(result.plannedBlocks.length === 3, 'Expected split blocks for in-progress and pending tasks')
  assert(result.plannedBlocks[0].taskId === taskInProgress.id, 'Expected in-progress tasks first')
  assert(result.unplannedTaskIds.includes(taskPending.id), 'Expected pending task to remain partially unplanned')
}
