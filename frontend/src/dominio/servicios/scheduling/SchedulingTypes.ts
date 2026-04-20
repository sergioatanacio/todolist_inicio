import type { DisponibilidadAggregate } from '../../entidades/DisponibilidadAggregate'
import type { TaskAggregate } from '../../entidades/TaskAggregate'
import type { TodoListAggregate } from '../../entidades/TodoListAggregate'

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

export type SchedulingOptions = {
  nowMs?: number
}

export type SchedulingInput = {
  disponibilidad: DisponibilidadAggregate
  todoLists: TodoListAggregate[]
  tasks: TaskAggregate[]
  options?: SchedulingOptions
}
