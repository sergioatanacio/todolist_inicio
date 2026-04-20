import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'
import { SchedulingPolicy } from '../servicios/SchedulingPolicy.ts'
import type { SchedulingInput, SchedulingResult } from '../servicios/SchedulingPolicy.ts'
import type { SchedulingStrategy } from '../servicios/scheduling/SchedulingStrategy.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

class SpySchedulingStrategy implements SchedulingStrategy {
  called = false
  receivedInput: SchedulingInput | null = null
  readonly result: SchedulingResult = {
    plannedBlocks: [],
    unplannedTaskIds: ['x'],
    tasksPerDay: {},
  }

  buildPlan(input: SchedulingInput) {
    this.called = true
    this.receivedInput = input
    return this.result
  }
}

const isoFromNow = (daysOffset: number): string => {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  )
  date.setUTCDate(date.getUTCDate() + daysOffset)
  return date.toISOString().slice(0, 10)
}

export const schedulingPolicyDelegationSpec = () => {
  const targetDate = isoFromNow(1)
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
  const strategy = new SpySchedulingStrategy()
  const policy = new SchedulingPolicy(strategy)
  const input: SchedulingInput = {
    disponibilidad,
    todoLists: [],
    tasks: [],
  }

  const output = policy.buildPlan(input)

  assert(strategy.called, 'Expected policy to delegate to provided strategy')
  assert(strategy.receivedInput === input, 'Expected strategy to receive original input')
  assert(output === strategy.result, 'Expected policy to return strategy output')
}
