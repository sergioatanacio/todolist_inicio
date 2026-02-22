import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import { SchedulingPolicy } from '../../../dominio/servicios/SchedulingPolicy'

type BuildDisponibilidadCalendarInput = {
  disponibilidadId: string
}

export class BuildDisponibilidadCalendarUseCase {
  constructor(
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly taskRepository: TaskRepository,
    private readonly schedulingPolicy: SchedulingPolicy,
  ) {}

  execute(input: BuildDisponibilidadCalendarInput) {
    const disponibilidad = this.disponibilidadRepository.findById(
      input.disponibilidadId,
    )
    if (!disponibilidad) {
      throw domainError('NOT_FOUND', 'Disponibilidad no encontrada')
    }
    const todoLists = this.todoListRepository
      .findByProjectId(disponibilidad.projectId)
      .filter((list) => list.disponibilidadId === disponibilidad.id)
    const tasks = todoLists.flatMap((list) =>
      this.taskRepository.findByTodoListId(list.id),
    )
    return this.schedulingPolicy.buildPlan({
      disponibilidad,
      todoLists,
      tasks,
    })
  }
}
