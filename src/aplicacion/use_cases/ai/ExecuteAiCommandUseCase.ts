import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { IdempotencyRepository } from '../../../dominio/puertos/IdempotencyRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiAuthorizationPolicy } from '../../../dominio/servicios/AiAuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import type { TaskStatus } from '../../../dominio/valores_objeto/TaskStatus'
import type { DisponibilidadAppService } from '../../DisponibilidadAppService'
import type { ProjectAppService } from '../../ProjectAppService'
import type { TaskPlanningAppService } from '../../TaskPlanningAppService'
import type { TodoListAppService } from '../../TodoListAppService'
import {
  type ExecuteAiCommandCommand,
  validateExecuteAiCommandCommand,
} from '../../commands/ai/ExecuteAiCommandCommand'
import { ListTasksDueTomorrowUseCase } from './ListTasksDueTomorrowUseCase'

type ExecuteAiResult =
  | { kind: 'mutated'; entityId: string }
  | { kind: 'query'; items: ReturnType<ListTasksDueTomorrowUseCase['execute']> }

const asString = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key]
  if (typeof value !== 'string' || value.trim().length < 1) {
    throw domainError('VALIDATION_ERROR', `El payload requiere ${key}`)
  }
  return value.trim()
}

const asNumber = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw domainError('VALIDATION_ERROR', `El payload requiere ${key} numerico`)
  }
  return value
}

export class ExecuteAiCommandUseCase {
  private readonly listTasksDueTomorrowUseCase: ListTasksDueTomorrowUseCase

  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly aiUserCredentialRepository: AiUserCredentialRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly projectAppService: ProjectAppService,
    private readonly todoListAppService: TodoListAppService,
    private readonly disponibilidadAppService: DisponibilidadAppService,
    private readonly taskPlanningAppService: TaskPlanningAppService,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {
    this.listTasksDueTomorrowUseCase = new ListTasksDueTomorrowUseCase(
      workspaceRepository,
      projectRepository,
      taskPlanningAppService,
    )
  }

  async execute(command: ExecuteAiCommandCommand): Promise<ExecuteAiResult> {
    const input = validateExecuteAiCommandCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')
      const agent = this.aiAgentRepository.findById(conversation.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      const workspace = this.workspaceRepository.findById(conversation.workspaceId)
      if (!workspace) throw domainError('NOT_FOUND', 'Workspace no encontrado')
      const commandModel = conversation.commands.find((item) => item.id === input.commandId)
      if (!commandModel) throw domainError('NOT_FOUND', 'Comando IA no encontrado')
      if (this.idempotencyRepository.exists(commandModel.idempotencyKey)) {
        throw domainError('DUPLICATE', 'Comando IA ya ejecutado')
      }
      if (
        commandModel.requiresApproval &&
        commandModel.state !== 'APPROVED'
      ) {
        throw domainError('INVALID_STATE', 'El comando requiere aprobacion previa')
      }
      if (!['PROPOSED', 'APPROVED'].includes(commandModel.state)) {
        throw domainError('INVALID_STATE', 'El comando no esta en estado ejecutable')
      }

      const project = conversation.projectId
        ? this.projectRepository.findById(conversation.projectId)
        : null

      if (
        !AiAuthorizationPolicy.canExecute({
          workspace,
          project,
          agent,
          initiatorUserId: input.actorUserId,
          intent: commandModel.intent,
        })
      ) {
        throw domainError('FORBIDDEN', 'El agente no puede ejecutar este comando')
      }
      const credential = this.aiUserCredentialRepository.findByWorkspaceAndUser(
        conversation.workspaceId,
        input.actorUserId,
      )
      if (!credential || credential.state !== 'ACTIVE') {
        throw domainError('FORBIDDEN', 'El usuario no tiene credencial IA activa en el workspace')
      }

      try {
        const result = await this.executeIntent(
          conversation.workspaceId,
          conversation.projectId,
          input.actorUserId,
          commandModel.intent,
          commandModel.payload,
        )
        const executed = conversation.markExecuted(commandModel.id, input.actorUserId)
        this.aiConversationRepository.save(executed)
        this.idempotencyRepository.save(commandModel.idempotencyKey, {
          conversationId: conversation.id,
          commandId: commandModel.id,
          intent: commandModel.intent,
        })
        await this.eventPublisher.publishFrom(executed)
        return result
      } catch (error) {
        const failed = conversation.markFailed(
          commandModel.id,
          error instanceof Error ? error.message : 'Error de ejecucion',
        )
        this.aiConversationRepository.save(failed)
        await this.eventPublisher.publishFrom(failed)
        throw error
      }
    })
  }

  private async executeIntent(
    workspaceId: string,
    projectId: string | null,
    initiatorUserId: number,
    intent: string,
    payload: Record<string, unknown>,
  ): Promise<ExecuteAiResult> {
    switch (intent) {
      case 'CREATE_PROJECT': {
        const created = await this.projectAppService.createProject({
          workspaceId,
          actorUserId: initiatorUserId,
          name: asString(payload, 'name'),
          description:
            typeof payload.description === 'string' ? payload.description : '',
        })
        return { kind: 'mutated', entityId: created.id }
      }
      case 'CREATE_TODO_LIST': {
        if (!projectId) throw domainError('CONFLICT', 'La conversacion no tiene projectId')
        const created = await this.todoListAppService.create({
          workspaceId,
          projectId,
          disponibilidadId: asString(payload, 'disponibilidadId'),
          actorUserId: initiatorUserId,
          name: asString(payload, 'name'),
          description:
            typeof payload.description === 'string' ? payload.description : '',
        })
        return { kind: 'mutated', entityId: created.id }
      }
      case 'CREATE_DISPONIBILIDAD': {
        if (!projectId) throw domainError('CONFLICT', 'La conversacion no tiene projectId')
        const created = await this.disponibilidadAppService.create({
          projectId,
          actorUserId: initiatorUserId,
          name: asString(payload, 'name'),
          description:
            typeof payload.description === 'string' ? payload.description : '',
          startDate: asString(payload, 'startDate'),
          endDate: asString(payload, 'endDate'),
        })
        return { kind: 'mutated', entityId: created.id }
      }
      case 'CREATE_TASK': {
        if (!projectId) throw domainError('CONFLICT', 'La conversacion no tiene projectId')
        const created = await this.taskPlanningAppService.createTask({
          workspaceId,
          projectId,
          todoListId: asString(payload, 'todoListId'),
          actorUserId: initiatorUserId,
          title: asString(payload, 'title'),
          durationMinutes:
            typeof payload.durationMinutes === 'number'
              ? asNumber(payload, 'durationMinutes')
              : undefined,
        })
        return { kind: 'mutated', entityId: created.id }
      }
      case 'UPDATE_TASK_STATUS': {
        if (!projectId) throw domainError('CONFLICT', 'La conversacion no tiene projectId')
        await this.taskPlanningAppService.changeTaskStatus({
          workspaceId,
          projectId,
          actorUserId: initiatorUserId,
          taskId: asString(payload, 'taskId'),
          toStatus: asString(payload, 'toStatus') as TaskStatus,
        })
        return { kind: 'mutated', entityId: asString(payload, 'taskId') }
      }
      case 'ADD_TASK_COMMENT':
        throw domainError(
          'CONFLICT',
          'ADD_TASK_COMMENT no esta implementado en capa de aplicacion',
        )
      case 'READ_TASKS_DUE_TOMORROW': {
        if (!projectId) throw domainError('CONFLICT', 'La conversacion no tiene projectId')
        const items = this.listTasksDueTomorrowUseCase.execute({
          workspaceId,
          projectId,
          actorUserId: initiatorUserId,
        })
        return { kind: 'query', items }
      }
      default:
        throw domainError('VALIDATION_ERROR', 'Intent IA no soportado')
    }
  }
}
