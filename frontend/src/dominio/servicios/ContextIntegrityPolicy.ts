import { domainError } from '../errores/DomainError'
import { AiAgentAggregate } from '../entidades/AiAgentAggregate'
import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate'
import { ProjectAggregate } from '../entidades/ProjectAggregate'
import { TaskAggregate } from '../entidades/TaskAggregate'
import { TodoListAggregate } from '../entidades/TodoListAggregate'
import { WorkspaceAggregate } from '../entidades/WorkspaceAggregate'

export class ContextIntegrityPolicy {
  static ensureProjectInWorkspace(
    workspace: WorkspaceAggregate,
    project: ProjectAggregate,
    message = 'Proyecto fuera de workspace',
  ) {
    if (project.workspaceId !== workspace.id) {
      throw domainError('CONFLICT', message)
    }
  }

  static ensureTodoListInProject(
    todoList: TodoListAggregate,
    project: ProjectAggregate,
    message = 'Lista fuera de proyecto',
  ) {
    if (todoList.projectId !== project.id) {
      throw domainError('CONFLICT', message)
    }
  }

  static ensureTaskInProject(
    task: TaskAggregate,
    project: ProjectAggregate,
    message = 'Tarea fuera de proyecto',
  ) {
    if (task.projectId !== project.id) {
      throw domainError('CONFLICT', message)
    }
  }

  static ensureDisponibilidadInProject(
    disponibilidad: DisponibilidadAggregate,
    project: ProjectAggregate,
    message = 'Disponibilidad fuera de proyecto',
  ) {
    if (disponibilidad.projectId !== project.id) {
      throw domainError('CONFLICT', message)
    }
  }

  static ensureAgentInWorkspace(
    agent: AiAgentAggregate,
    workspace: WorkspaceAggregate,
    message = 'Agente fuera de contexto',
  ) {
    if (agent.workspaceId !== workspace.id) {
      throw domainError('CONFLICT', message)
    }
  }
}

