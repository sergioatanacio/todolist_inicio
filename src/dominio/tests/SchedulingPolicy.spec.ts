import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../entidades/TodoListAggregate.ts'
import { SchedulingPolicy } from '../servicios/SchedulingPolicy.ts'

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

export const schedulingPolicySpec = () => {
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

  const taskDone = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listA.id,
    title: 'A done',
    createdByUserId: 1,
    durationMinutes: 20,
    orderInList: 2,
  }).changeStatus(1, 'DONE')

  const taskAbandoned = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listB.id,
    title: 'B abandoned',
    createdByUserId: 1,
    durationMinutes: 20,
    orderInList: 2,
  }).changeStatus(1, 'ABANDONED')

  const policy = new SchedulingPolicy()
  const nowMs = atUtc(targetDate, 9, 20)
  const result = policy.buildPlan({
    disponibilidad,
    todoLists: [listA, listB],
    tasks: [taskPending, taskInProgress, taskDone, taskAbandoned],
    options: { nowMs },
  })

  assert(result.plannedBlocks.length === 3, 'Expected split blocks for in-progress and pending tasks')
  assert(
    result.plannedBlocks[0].taskId === taskInProgress.id,
    'Expected IN_PROGRESS tasks to be scheduled first',
  )
  assert(
    result.plannedBlocks[0].durationMinutes === 40,
    'Expected first split block to consume remaining morning window',
  )
  assert(
    result.plannedBlocks[1].taskId === taskInProgress.id &&
      result.plannedBlocks[1].durationMinutes === 30,
    'Expected in-progress task to continue on next window',
  )
  assert(
    result.plannedBlocks[2].taskId === taskPending.id &&
      result.plannedBlocks[2].durationMinutes === 30,
    'Expected pending task to consume remaining capacity after in-progress',
  )
  assert(
    result.unplannedTaskIds.includes(taskPending.id),
    'Expected pending task to stay partially unplanned when no more capacity exists',
  )
  assert(
    !result.unplannedTaskIds.includes(taskDone.id) &&
      !result.unplannedTaskIds.includes(taskAbandoned.id),
    'Expected DONE/ABANDONED tasks to be excluded from planning queue',
  )
  assert(
    result.tasksPerDay[targetDate] === 3,
    'Expected daily count by planned blocks',
  )
}
