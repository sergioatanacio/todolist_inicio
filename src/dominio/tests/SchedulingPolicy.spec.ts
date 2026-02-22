import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../entidades/TodoListAggregate.ts'
import { SchedulingPolicy } from '../servicios/SchedulingPolicy.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

export const schedulingPolicySpec = () => {
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: 'p-1',
    name: 'Semana',
    startDate: '2026-02-02',
    endDate: '2026-02-02',
    segments: [
      {
        name: 'Bloque maniana',
        startTime: '09:00',
        endTime: '12:00',
        specificDates: ['2026-02-02'],
      },
    ],
  })

  const listA = TodoListAggregate.create('p-1', disponibilidad.id, 1, 'A', '')
  const listB = TodoListAggregate.create('p-1', disponibilidad.id, 2, 'B', '')

  const taskA1 = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listA.id,
    title: 'A1',
    createdByUserId: 1,
    durationMinutes: 120,
    orderInList: 1,
  })
  const taskB1 = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: listB.id,
    title: 'B1',
    createdByUserId: 1,
    durationMinutes: 120,
    orderInList: 1,
  })

  const policy = new SchedulingPolicy()
  const result = policy.buildPlan({
    disponibilidad,
    todoLists: [listA, listB],
    tasks: [taskA1, taskB1],
  })

  assert(result.plannedBlocks.length === 1, 'Expected only first task to fit')
  assert(
    result.plannedBlocks[0].taskId === taskA1.id,
    'Expected list A task to be scheduled first',
  )
  assert(
    result.unplannedTaskIds.includes(taskB1.id),
    'Expected list B task to stay unplanned when time is exhausted',
  )
}
