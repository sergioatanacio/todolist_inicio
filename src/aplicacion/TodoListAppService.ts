import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import type { CreateTodoListCommand } from './commands/todolist/CreateTodoListCommand'
import { CreateTodoListUseCase } from './use_cases/todolist/CreateTodoListUseCase'
import { ListTodoListsByProjectUseCase } from './use_cases/todolist/ListTodoListsByProjectUseCase'

export class TodoListAppService {
  private readonly createTodoListUseCase: CreateTodoListUseCase
  private readonly listTodoListsByProjectUseCase: ListTodoListsByProjectUseCase

  constructor(
    todoListRepository: TodoListRepository,
    workspaceRepository: WorkspaceRepository,
    projectRepository: ProjectRepository,
    disponibilidadRepository: DisponibilidadRepository,
    unitOfWork: UnitOfWork,
  ) {
    this.createTodoListUseCase = new CreateTodoListUseCase(
      todoListRepository,
      workspaceRepository,
      projectRepository,
      disponibilidadRepository,
      unitOfWork,
    )
    this.listTodoListsByProjectUseCase = new ListTodoListsByProjectUseCase(
      todoListRepository,
    )
  }

  create(command: CreateTodoListCommand) {
    return this.createTodoListUseCase.execute(command)
  }

  listByProject(projectId: string) {
    return this.listTodoListsByProjectUseCase.execute({ projectId })
  }
}
