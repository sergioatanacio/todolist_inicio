import { domainError } from '../../../dominio/errores/DomainError'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { EditingAuthorizationPolicy } from '../../../dominio/servicios/EditingAuthorizationPolicy'
import {
  type ReassignTodoListDisponibilidadCommand,
  validateReassignTodoListDisponibilidadCommand,
} from '../../commands/todolist/ReassignTodoListDisponibilidadCommand'

export class ReassignTodoListDisponibilidadUseCase {
  constructor(
    private readonly todoListRepository: TodoListRepository,
    private readonly disponibilidadRepository: DisponibilidadRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: ReassignTodoListDisponibilidadCommand) {
    const input = validateReassignTodoListDisponibilidadCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const todoList = this.todoListRepository.findById(input.todoListId)
      const disponibilidad = this.disponibilidadRepository.findById(
        input.disponibilidadId,
      )
      if (!workspace || !project || !todoList || !disponibilidad) {
        throw domainError('NOT_FOUND', 'Entidad no encontrada')
      }
      ContextIntegrityPolicy.ensureProjectInWorkspace(
        workspace,
        project,
        'Contexto inconsistente para reasignar lista',
      )
      ContextIntegrityPolicy.ensureTodoListInProject(
        todoList,
        project,
        'Contexto inconsistente para reasignar lista',
      )
      ContextIntegrityPolicy.ensureDisponibilidadInProject(
        disponibilidad,
        project,
        'Contexto inconsistente para reasignar lista',
      )
      EditingAuthorizationPolicy.ensureTodoListEditable(
        workspace,
        project,
        input.actorUserId,
      )
      const inDisponibilidad = this.todoListRepository
        .findByProjectId(project.id)
        .filter((item) => item.disponibilidadId === disponibilidad.id)
      const nextOrder =
        inDisponibilidad.reduce(
          (max, item) => Math.max(max, item.orderInDisponibilidad),
          0,
        ) + 1
      const updated = todoList
        .reassignDisponibilidad(disponibilidad.id)
        .setOrderInDisponibilidad(nextOrder)
      this.todoListRepository.save(updated)
      return updated
    })
  }
}
