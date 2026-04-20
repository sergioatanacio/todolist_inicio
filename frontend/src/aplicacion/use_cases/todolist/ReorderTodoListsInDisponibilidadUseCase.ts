import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { EditingAuthorizationPolicy } from '../../../dominio/servicios/EditingAuthorizationPolicy'
import {
  type ReorderTodoListsInDisponibilidadCommand,
  validateReorderTodoListsInDisponibilidadCommand,
} from '../../commands/todolist/ReorderTodoListsInDisponibilidadCommand'

export class ReorderTodoListsInDisponibilidadUseCase {
  constructor(
    private readonly todoListRepository: TodoListRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: ReorderTodoListsInDisponibilidadCommand) {
    const input = validateReorderTodoListsInDisponibilidadCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      if (!workspace || !project) {
        throw domainError('NOT_FOUND', 'Workspace o proyecto no encontrado')
      }
      ContextIntegrityPolicy.ensureProjectInWorkspace(
        workspace,
        project,
        'Proyecto no pertenece al workspace',
      )
      EditingAuthorizationPolicy.ensureTodoListEditable(
        workspace,
        project,
        input.actorUserId,
        'No tienes permisos para ordenar listas',
      )
      const lists = this.todoListRepository
        .findByProjectId(project.id)
        .filter((item) => item.disponibilidadId === input.disponibilidadId)
      const byId = new Map(lists.map((item) => [item.id, item]))
      if (input.orderedTodoListIds.length !== lists.length) {
        throw domainError('CONFLICT', 'La lista de orden no coincide con las listas existentes')
      }
      const uniqueIds = new Set(input.orderedTodoListIds)
      if (uniqueIds.size !== input.orderedTodoListIds.length) {
        throw domainError('DUPLICATE', 'IDs duplicados en orden de listas')
      }
      const updated = input.orderedTodoListIds.map((id, index) => {
        const item = byId.get(id)
        if (!item) {
          throw domainError('NOT_FOUND', 'Una lista del orden no existe')
        }
        const next = item.setOrderInDisponibilidad(index + 1)
        this.todoListRepository.save(next)
        return next
      })
      return updated
    })
  }
}
