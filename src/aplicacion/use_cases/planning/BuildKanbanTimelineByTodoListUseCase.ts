import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import {
  KanbanTimelineService,
  type KanbanTimeline,
} from '../../../dominio/servicios/KanbanTimelineService'

export type BuildKanbanTimelineByTodoListResult = {
  disponibilidadId: string
  todoListId: string
} & KanbanTimeline

type BuildKanbanTimelineByTodoListInput = {
  todoListId: string
  slotMinutes?: number
}

export class BuildKanbanTimelineByTodoListUseCase {
  private readonly timelineService: KanbanTimelineService

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly disponibilidadRepository: DisponibilidadRepository,
    timelineService?: KanbanTimelineService,
  ) {
    this.timelineService = timelineService ?? new KanbanTimelineService()
  }

  execute(
    input: BuildKanbanTimelineByTodoListInput,
  ): BuildKanbanTimelineByTodoListResult {
    const todoList = this.todoListRepository.findById(input.todoListId)
    if (!todoList) {
      throw new Error('Lista no encontrada para timeline de Kanban')
    }
    const disponibilidad = this.disponibilidadRepository.findById(todoList.disponibilidadId)
    if (!disponibilidad) {
      throw new Error('Disponibilidad no encontrada para timeline de Kanban')
    }
    const tasks = this.taskRepository.findByTodoListId(input.todoListId)
    const timeline = this.timelineService.buildByDisponibilidad(
      disponibilidad,
      tasks,
      input.slotMinutes,
    )

    return {
      disponibilidadId: disponibilidad.id,
      todoListId: todoList.id,
      ...timeline,
    }
  }
}
