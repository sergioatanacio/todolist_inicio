import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { TaskWorkflowService } from '../../../dominio/servicios/TaskWorkflowService'
import {
  type ToggleTaskDoneCommand,
  validateToggleTaskDoneCommand,
} from '../../commands/task/ToggleTaskDoneCommand'

export class ToggleTaskDoneUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly workflow: TaskWorkflowService,
  ) {}

  execute(command: ToggleTaskDoneCommand) {
    const input = validateToggleTaskDoneCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const task = this.taskRepository.findById(input.taskId)
      if (!workspace || !project || !task) {
        throw domainError('NOT_FOUND', 'Contexto o tarea no encontrada')
      }
      ContextIntegrityPolicy.ensureProjectInWorkspace(
        workspace,
        project,
        'Tarea fuera de contexto de proyecto',
      )
      ContextIntegrityPolicy.ensureTaskInProject(
        task,
        project,
        'Tarea fuera de contexto de proyecto',
      )
      const updated = this.workflow.toggleDone(task, {
        workspace,
        project,
        actorUserId: input.actorUserId,
      })
      this.taskRepository.save(updated)
      return updated
    })
  }
}
