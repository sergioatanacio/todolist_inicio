import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import {
  type ReorderTasksInTodoListCommand,
  validateReorderTasksInTodoListCommand,
} from '../../commands/task/ReorderTasksInTodoListCommand'

export class ReorderTasksInTodoListUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: ReorderTasksInTodoListCommand) {
    const input = validateReorderTasksInTodoListCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const todoList = this.todoListRepository.findById(input.todoListId)
      if (!workspace || !project || !todoList) {
        throw domainError('NOT_FOUND', 'Contexto no encontrado')
      }
      if (project.workspaceId !== workspace.id || todoList.projectId !== project.id) {
        throw domainError('CONFLICT', 'Contexto inconsistente para reordenar tareas')
      }
      if (
        !AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'task.update',
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para ordenar tareas')
      }
      const tasks = this.taskRepository.findByTodoListId(todoList.id)
      const byId = new Map(tasks.map((task) => [task.id, task]))
      if (input.orderedTaskIds.length !== tasks.length) {
        throw domainError('CONFLICT', 'Orden incompleto de tareas')
      }
      const uniqueIds = new Set(input.orderedTaskIds)
      if (uniqueIds.size !== input.orderedTaskIds.length) {
        throw domainError('DUPLICATE', 'IDs de tareas duplicados')
      }
      const updated = input.orderedTaskIds.map((id, index) => {
        const task = byId.get(id)
        if (!task) throw domainError('NOT_FOUND', 'Una tarea no existe en la lista')
        const next = task.setOrderInList(input.actorUserId, index + 1)
        this.taskRepository.save(next)
        return next
      })
      return updated
    })
  }
}
