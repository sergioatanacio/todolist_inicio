import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import {
  type UpdateTodoListCommand,
  validateUpdateTodoListCommand,
} from '../../commands/todolist/UpdateTodoListCommand'

export class UpdateTodoListUseCase {
  constructor(
    private readonly todoListRepository: TodoListRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: UpdateTodoListCommand) {
    const input = validateUpdateTodoListCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const todoList = this.todoListRepository.findById(input.todoListId)
      if (!workspace || !project || !todoList) {
        throw domainError('NOT_FOUND', 'Entidad no encontrada')
      }
      if (project.workspaceId !== workspace.id || todoList.projectId !== project.id) {
        throw domainError('CONFLICT', 'Contexto inconsistente para editar lista')
      }
      if (
        !AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'project.todolists.create',
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para editar listas')
      }

      const updated = todoList
        .rename(input.name)
        .updateDescription(input.description)
      this.todoListRepository.save(updated)
      return updated
    })
  }
}

