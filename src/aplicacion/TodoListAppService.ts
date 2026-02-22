import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import type { CreateTodoListCommand } from './commands/todolist/CreateTodoListCommand'
import type { ReassignTodoListDisponibilidadCommand } from './commands/todolist/ReassignTodoListDisponibilidadCommand'
import type { ReorderTodoListsInDisponibilidadCommand } from './commands/todolist/ReorderTodoListsInDisponibilidadCommand'
import { CreateTodoListUseCase } from './use_cases/todolist/CreateTodoListUseCase'
import { ListTodoListsByProjectUseCase } from './use_cases/todolist/ListTodoListsByProjectUseCase'
import { ReassignTodoListDisponibilidadUseCase } from './use_cases/todolist/ReassignTodoListDisponibilidadUseCase'
import { ReorderTodoListsInDisponibilidadUseCase } from './use_cases/todolist/ReorderTodoListsInDisponibilidadUseCase'

export class TodoListAppService {
  private readonly createTodoListUseCase: CreateTodoListUseCase
  private readonly listTodoListsByProjectUseCase: ListTodoListsByProjectUseCase
  private readonly reassignTodoListDisponibilidadUseCase: ReassignTodoListDisponibilidadUseCase
  private readonly reorderTodoListsInDisponibilidadUseCase: ReorderTodoListsInDisponibilidadUseCase

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
    this.reassignTodoListDisponibilidadUseCase =
      new ReassignTodoListDisponibilidadUseCase(
        todoListRepository,
        disponibilidadRepository,
        projectRepository,
        workspaceRepository,
        unitOfWork,
      )
    this.reorderTodoListsInDisponibilidadUseCase =
      new ReorderTodoListsInDisponibilidadUseCase(
        todoListRepository,
        projectRepository,
        workspaceRepository,
        unitOfWork,
      )
  }

  create(command: CreateTodoListCommand) {
    return this.createTodoListUseCase.execute(command)
  }

  listByProject(projectId: string) {
    return this.listTodoListsByProjectUseCase.execute({ projectId })
  }

  reassignDisponibilidad(command: ReassignTodoListDisponibilidadCommand) {
    return this.reassignTodoListDisponibilidadUseCase.execute(command)
  }

  reorderInDisponibilidad(command: ReorderTodoListsInDisponibilidadCommand) {
    return this.reorderTodoListsInDisponibilidadUseCase.execute(command)
  }
}
