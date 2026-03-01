import { domainError } from '../../../dominio/errores/DomainError'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { TaskWorkflowService } from '../../../dominio/servicios/TaskWorkflowService'
import {
  type UpdateTaskCommand,
  validateUpdateTaskCommand,
} from '../../commands/task/UpdateTaskCommand'

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly workflow: TaskWorkflowService,
  ) {}

  execute(command: UpdateTaskCommand) {
    const input = validateUpdateTaskCommand(command)
    return this.unitOfWork.runInTransaction(() => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      const project = this.projectRepository.findById(input.projectId)
      const task = this.taskRepository.findById(input.taskId)
      if (!workspace || !project || !task) {
        throw domainError('NOT_FOUND', 'Contexto o tarea no encontrada')
      }
      if (project.workspaceId !== workspace.id || task.projectId !== project.id) {
        throw domainError('CONFLICT', 'Tarea fuera de contexto de proyecto')
      }

      const updated = this.workflow.updateTask(
        task,
        {
          title: input.title,
          durationMinutes: input.durationMinutes,
        },
        {
          workspace,
          project,
          actorUserId: input.actorUserId,
        },
      )
      this.taskRepository.save(updated)
      return updated
    })
  }
}

