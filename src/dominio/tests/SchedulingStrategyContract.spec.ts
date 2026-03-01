import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../entidades/TodoListAggregate.ts'
import type { SchedulingStrategy } from '../servicios/scheduling/SchedulingStrategy.ts'
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

const runContract = (strategy: SchedulingStrategy) => {
  const targetDate = isoFromNow(2)
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: 'p-1',
    name: 'Semana',
    startDate: targetDate,
    endDate: targetDate,
    segments: [
      {
        name: 'Bloque',
        startTime: '09:00',
        endTime: '10:00',
        specificDates: [targetDate],
      },
    ],
  })
  const list = TodoListAggregate.create('p-1', disponibilidad.id, 1, 'Lista A', '')
  const task = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: list.id,
    title: 'A pending',
    createdByUserId: 1,
    durationMinutes: 20,
    orderInList: 1,
  })

  const result = strategy.buildPlan({
    disponibilidad,
    todoLists: [list],
    tasks: [task],
    options: { nowMs: Date.parse(`${targetDate}T08:00:00.000Z`) },
  })

  assert(Array.isArray(result.plannedBlocks), 'Expected plannedBlocks to be an array')
  assert(Array.isArray(result.unplannedTaskIds), 'Expected unplannedTaskIds to be an array')
  for (const block of result.plannedBlocks) {
    assert(block.scheduledStart < block.scheduledEnd, 'Expected block with valid time range')
    assert(block.durationMinutes > 0, 'Expected positive duration in minutes')
    assert(block.disponibilidadId === disponibilidad.id, 'Expected block linked to requested disponibilidad')
  }
}

export const schedulingStrategyContractSpec = () => {
  runContract(new GreedySchedulingStrategy())
}
