import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import { SchedulingPolicy } from '../../../dominio/servicios/SchedulingPolicy'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'

type BuildProjectCalendarInput = {
  projectId: string
}

export class BuildProjectCalendarUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly taskRepository: TaskRepository,
    private readonly schedulingPolicy: SchedulingPolicy,
  ) {}

  execute(input: BuildProjectCalendarInput) {
    const disponibilidades = this.disponibilidadRepository.findByProjectId(
      input.projectId,
    )
    const projectTasksPerDay: Record<string, number> = {}
    for (const disponibilidad of disponibilidades) {
      const lists = this.todoListRepository
        .findByProjectId(input.projectId)
        .filter((list) => list.disponibilidadId === disponibilidad.id)
      const tasks = lists.flatMap((list) => this.taskRepository.findByTodoListId(list.id))
      const result = this.schedulingPolicy.buildPlan({
        disponibilidad,
        todoLists: lists,
        tasks,
      })
      for (const [day, count] of Object.entries(result.tasksPerDay)) {
        projectTasksPerDay[day] = (projectTasksPerDay[day] ?? 0) + count
      }
    }
    return projectTasksPerDay
  }
}
