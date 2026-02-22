import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import { SchedulingPolicy } from '../../../dominio/servicios/SchedulingPolicy'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'

type BuildProjectCalendarInput = {
  projectId: string
  nowMs?: number
}

export type ProjectCalendarPlannedBlock = {
  taskId: string
  taskTitle: string
  todoListId: string
  todoListName: string
  disponibilidadId: string
  scheduledStart: number
  scheduledEnd: number
  durationMinutes: number
}

export type BuildProjectCalendarDetailedOutput = {
  tasksPerDay: Record<string, number>
  plannedBlocks: ProjectCalendarPlannedBlock[]
  unplannedTaskIds: string[]
}

export class BuildProjectCalendarUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly taskRepository: TaskRepository,
    private readonly schedulingPolicy: SchedulingPolicy,
  ) {}

  execute(input: BuildProjectCalendarInput) {
    return this.executeDetailed(input).tasksPerDay
  }

  executeDetailed(input: BuildProjectCalendarInput): BuildProjectCalendarDetailedOutput {
    const disponibilidades = this.disponibilidadRepository.findByProjectId(
      input.projectId,
    )
    const projectTasksPerDay: Record<string, number> = {}
    const projectPlannedBlocks: ProjectCalendarPlannedBlock[] = []
    const unplannedTaskIds = new Set<string>()

    for (const disponibilidad of disponibilidades) {
      const lists = this.todoListRepository
        .findByProjectId(input.projectId)
        .filter((list) => list.disponibilidadId === disponibilidad.id)
      const tasks = lists.flatMap((list) => this.taskRepository.findByTodoListId(list.id))
      const taskTitleById = new Map(tasks.map((task) => [task.id, task.title]))
      const listNameById = new Map(lists.map((list) => [list.id, list.name]))
      const result = this.schedulingPolicy.buildPlan({
        disponibilidad,
        todoLists: lists,
        tasks,
        options: { nowMs: input.nowMs },
      })
      for (const [day, count] of Object.entries(result.tasksPerDay)) {
        projectTasksPerDay[day] = (projectTasksPerDay[day] ?? 0) + count
      }
      for (const block of result.plannedBlocks) {
        projectPlannedBlocks.push({
          taskId: block.taskId,
          taskTitle: taskTitleById.get(block.taskId) ?? block.taskId,
          todoListId: block.todoListId,
          todoListName: listNameById.get(block.todoListId) ?? block.todoListId,
          disponibilidadId: block.disponibilidadId,
          scheduledStart: block.scheduledStart,
          scheduledEnd: block.scheduledEnd,
          durationMinutes: block.durationMinutes,
        })
      }
      for (const taskId of result.unplannedTaskIds) {
        unplannedTaskIds.add(taskId)
      }
    }

    projectPlannedBlocks.sort((a, b) => a.scheduledStart - b.scheduledStart)

    return {
      tasksPerDay: projectTasksPerDay,
      plannedBlocks: projectPlannedBlocks,
      unplannedTaskIds: [...unplannedTaskIds],
    }
  }
}
