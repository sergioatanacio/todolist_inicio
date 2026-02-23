import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { AiChatGateway } from '../../../dominio/puertos/AiChatGateway'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { AiCredentialSecretStore } from '../../../dominio/puertos/AiCredentialSecretStore'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AuthorizationPolicy } from '../../../dominio/servicios/AuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { parseAiIntentType } from '../../../dominio/valores_objeto/AiIntentType'
import {
  type SendAiChatMessageCommand,
  validateSendAiChatMessageCommand,
} from '../../commands/ai/SendAiChatMessageCommand'

const mapConversationRoleToGatewayRole = (role: 'USER' | 'AGENT' | 'SYSTEM') =>
  role === 'USER' ? 'user' : role === 'AGENT' ? 'assistant' : 'system'

const nextIdempotencyKey = (conversationId: string, index: number) =>
  `ai-${conversationId}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`

export class SendAiChatMessageUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly aiUserCredentialRepository: AiUserCredentialRepository,
    private readonly secretStore: AiCredentialSecretStore,
    private readonly chatGateway: AiChatGateway,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: SendAiChatMessageCommand) {
    const input = validateSendAiChatMessageCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')

      const workspace = this.workspaceRepository.findById(conversation.workspaceId)
      if (!workspace) throw domainError('NOT_FOUND', 'Workspace no encontrado')
      if (!workspace.members.some((member) => member.userId === input.actorUserId && member.active)) {
        throw domainError('FORBIDDEN', 'El actor no pertenece al workspace')
      }

      if (conversation.projectId) {
        const project = this.projectRepository.findById(conversation.projectId)
        if (!project || project.workspaceId !== workspace.id) {
          throw domainError('NOT_FOUND', 'Proyecto no encontrado en la conversacion')
        }
        const canViewProject = AuthorizationPolicy.canInProject({
          workspace,
          project,
          actorUserId: input.actorUserId,
          permission: 'project.view',
        })
        if (!canViewProject) {
          throw domainError('FORBIDDEN', 'El actor no tiene acceso al proyecto de la conversacion')
        }
      }

      const agent = this.aiAgentRepository.findById(conversation.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      if (agent.workspaceId !== workspace.id) {
        throw domainError('CONFLICT', 'Agente fuera de contexto')
      }
      if (agent.state !== 'ACTIVE') {
        throw domainError('FORBIDDEN', 'El agente IA no esta activo')
      }

      const credential = this.aiUserCredentialRepository.findByWorkspaceAndUser(
        conversation.workspaceId,
        input.actorUserId,
      )
      if (!credential || credential.state !== 'ACTIVE') {
        throw domainError('FORBIDDEN', 'El usuario no tiene credencial IA activa')
      }

      const token = this.secretStore.getByCredentialRef(credential.credentialRef)
      if (!token) {
        throw domainError('FORBIDDEN', 'No hay token IA registrado para la credencial activa')
      }

      let updated = conversation.addUserMessage(input.actorUserId, input.message)
      const response = await this.chatGateway.chat({
        model: agent.model,
        token,
        messages: updated.messages.map((msg) => ({
          role: mapConversationRoleToGatewayRole(msg.role),
          content: msg.body,
        })),
        allowedIntents: agent.policy.allowedIntents,
      })

      if (response.assistantMessage.trim().length > 0) {
        updated = updated.addAgentMessage(response.assistantMessage)
      }

      for (let index = 0; index < response.toolCalls.length; index += 1) {
        const toolCall = response.toolCalls[index]
        try {
          const intent = parseAiIntentType(toolCall.intent)
          if (!agent.policy.allows(intent)) continue
          updated = updated.proposeCommand({
            intent,
            payload: toolCall.payload,
            idempotencyKey: nextIdempotencyKey(conversation.id, index),
            proposedByUserId: input.actorUserId,
          })
        } catch {
          // Ignorar tool calls invalidos o fuera de politica.
        }
      }

      this.aiConversationRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
