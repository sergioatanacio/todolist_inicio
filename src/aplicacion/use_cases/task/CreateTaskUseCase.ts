import { TaskAggregate } from '../../../dominio/entidades/TaskAggregate'
import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import {
  type CreateTaskCommand,
  validateCreateTaskCommand,
} from '../../commands/task/CreateTaskCommand'

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly todoListRepository: TodoListRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: CreateTaskCommand) {
    const input = validateCreateTaskCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const todoList = this.todoListRepository.findById(input.todoListId)
      if (!workspace || !project || !todoList) {
        throw domainError('NOT_FOUND', 'Contexto no encontrado')
      }
      if (project.workspaceId !== workspace.id || todoList.projectId !== project.id) {
        throw domainError('CONFLICT', 'Proyecto o lista fuera de contexto')
      }
      if (
        !AuthorizationPolicy.canCreateTask({
          workspace,
          project,
          actorUserId: input.actorUserId,
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para crear tareas')
      }
      const existing = this.taskRepository.findByTodoListId(todoList.id)
      const maxOrder = existing.reduce((max, item) => Math.max(max, item.orderInList), 0)
      const task = TaskAggregate.create({
        projectId: project.id,
        todoListId: todoList.id,
        title: input.title,
        createdByUserId: input.actorUserId,
        durationMinutes: input.durationMinutes,
        orderInList: maxOrder + 1,
      })
      this.taskRepository.save(task)
      return task
    })
  }
}
