import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { TaskRepository } from '../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import { SchedulingPolicy } from '../dominio/servicios/SchedulingPolicy'
import { TaskWorkflowService } from '../dominio/servicios/TaskWorkflowService'
import type { ChangeTaskStatusCommand } from './commands/task/ChangeTaskStatusCommand'
import type { CreateTaskCommand } from './commands/task/CreateTaskCommand'
import type { ReorderTasksInTodoListCommand } from './commands/task/ReorderTasksInTodoListCommand'
import type { ToggleTaskDoneCommand } from './commands/task/ToggleTaskDoneCommand'
import { BuildDisponibilidadCalendarUseCase } from './use_cases/planning/BuildDisponibilidadCalendarUseCase'
import { BuildProjectCalendarUseCase } from './use_cases/planning/BuildProjectCalendarUseCase'
import { ChangeTaskStatusUseCase } from './use_cases/task/ChangeTaskStatusUseCase'
import { CreateTaskUseCase } from './use_cases/task/CreateTaskUseCase'
import { GetKanbanByTodoListUseCase } from './use_cases/task/GetKanbanByTodoListUseCase'
import { ReorderTasksInTodoListUseCase } from './use_cases/task/ReorderTasksInTodoListUseCase'
import { ToggleTaskDoneUseCase } from './use_cases/task/ToggleTaskDoneUseCase'

export class TaskPlanningAppService {
  private readonly buildDisponibilidadCalendarUseCase: BuildDisponibilidadCalendarUseCase
  private readonly buildProjectCalendarUseCase: BuildProjectCalendarUseCase
  private readonly getKanbanByTodoListUseCase: GetKanbanByTodoListUseCase
  private readonly reorderTasksInTodoListUseCase: ReorderTasksInTodoListUseCase
  private readonly createTaskUseCase: CreateTaskUseCase
  private readonly changeTaskStatusUseCase: ChangeTaskStatusUseCase
  private readonly toggleTaskDoneUseCase: ToggleTaskDoneUseCase

  constructor(
    taskRepository: TaskRepository,
    todoListRepository: TodoListRepository,
    disponibilidadRepository: DisponibilidadRepository,
    projectRepository: ProjectRepository,
    workspaceRepository: WorkspaceRepository,
    unitOfWork: UnitOfWork,
  ) {
    const policy = new SchedulingPolicy()
    const workflow = new TaskWorkflowService()
    this.buildDisponibilidadCalendarUseCase =
      new BuildDisponibilidadCalendarUseCase(
        disponibilidadRepository,
        todoListRepository,
        taskRepository,
        policy,
      )
    this.buildProjectCalendarUseCase = new BuildProjectCalendarUseCase(
      disponibilidadRepository,
      todoListRepository,
      taskRepository,
      policy,
    )
    this.getKanbanByTodoListUseCase = new GetKanbanByTodoListUseCase(taskRepository)
    this.reorderTasksInTodoListUseCase = new ReorderTasksInTodoListUseCase(
      taskRepository,
      todoListRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
    )
    this.createTaskUseCase = new CreateTaskUseCase(
      taskRepository,
      todoListRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
    )
    this.changeTaskStatusUseCase = new ChangeTaskStatusUseCase(
      taskRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
      workflow,
    )
    this.toggleTaskDoneUseCase = new ToggleTaskDoneUseCase(
      taskRepository,
      projectRepository,
      workspaceRepository,
      unitOfWork,
      workflow,
    )
  }

  buildDisponibilidadCalendar(disponibilidadId: string) {
    return this.buildDisponibilidadCalendarUseCase.execute({ disponibilidadId })
  }

  buildProjectCalendar(projectId: string) {
    return this.buildProjectCalendarUseCase.execute({ projectId })
  }

  getKanbanByTodoList(todoListId: string) {
    return this.getKanbanByTodoListUseCase.execute({ todoListId })
  }

  reorderTasksInTodoList(command: ReorderTasksInTodoListCommand) {
    return this.reorderTasksInTodoListUseCase.execute(command)
  }

  createTask(command: CreateTaskCommand) {
    return this.createTaskUseCase.execute(command)
  }

  changeTaskStatus(command: ChangeTaskStatusCommand) {
    return this.changeTaskStatusUseCase.execute(command)
  }

  toggleTaskDone(command: ToggleTaskDoneCommand) {
    return this.toggleTaskDoneUseCase.execute(command)
  }
}
