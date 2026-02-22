import { TodoListAggregate } from '../../../dominio/entidades/TodoListAggregate'
import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import {
  type CreateTodoListCommand,
  validateCreateTodoListCommand,
} from '../../commands/todolist/CreateTodoListCommand'

export class CreateTodoListUseCase {
  constructor(
    private readonly todoListRepository: TodoListRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: CreateTodoListCommand) {
    const input = validateCreateTodoListCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) {
        throw domainError('NOT_FOUND', 'Workspace no encontrado')
      }
      const project = this.projectRepository.findById(input.projectId)
      if (!project) {
        throw domainError('NOT_FOUND', 'Proyecto no encontrado')
      }
      const disponibilidad = this.disponibilidadRepository.findById(
        input.disponibilidadId,
      )
      if (!disponibilidad) {
        throw domainError('NOT_FOUND', 'Disponibilidad no encontrada')
      }
      if (project.workspaceId !== workspace.id || disponibilidad.projectId !== project.id) {
        throw domainError('CONFLICT', 'Proyecto o disponibilidad no pertenecen al contexto')
      }
      if (
        !AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'project.todolists.create',
        })
      ) {
        throw domainError('FORBIDDEN', 'No tienes permisos para crear listas de tareas')
      }
      const todoList = TodoListAggregate.create(
        input.projectId,
        input.disponibilidadId,
        input.name,
        input.description,
      )
      this.todoListRepository.save(todoList)
      return todoList
    })
  }
}
