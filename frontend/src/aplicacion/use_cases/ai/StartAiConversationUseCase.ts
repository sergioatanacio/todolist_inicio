import { domainError } from '../../../dominio/errores/DomainError'
import { AiConversationAggregate } from '../../../dominio/entidades/AiConversationAggregate'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiCredentialAuthorizationPolicy } from '../../../dominio/servicios/AiCredentialAuthorizationPolicy'
import { ContextIntegrityPolicy } from '../../../dominio/servicios/ContextIntegrityPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type StartAiConversationCommand,
  validateStartAiConversationCommand,
} from '../../commands/ai/StartAiConversationCommand'

export class StartAiConversationUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: StartAiConversationCommand) {
    const input = validateStartAiConversationCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) throw domainError('NOT_FOUND', 'Workspace no encontrado')
      AiCredentialAuthorizationPolicy.ensureActiveMember(
        workspace,
        input.actorUserId,
        'El actor no pertenece al workspace',
      )
      const agent = this.aiAgentRepository.findById(input.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      ContextIntegrityPolicy.ensureAgentInWorkspace(agent, workspace)
      if (input.projectId) {
        const project = this.projectRepository.findById(input.projectId)
        if (!project) {
          throw domainError('NOT_FOUND', 'Proyecto no encontrado para la conversacion')
        }
        ContextIntegrityPolicy.ensureProjectInWorkspace(
          workspace,
          project,
          'Proyecto no encontrado para la conversacion',
        )
      }
      const conversation = AiConversationAggregate.start({
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        initiatorUserId: input.actorUserId,
        agentId: input.agentId,
      })
      this.aiConversationRepository.save(conversation)
      await this.eventPublisher.publishFrom(conversation)
      return conversation
    })
  }
}
