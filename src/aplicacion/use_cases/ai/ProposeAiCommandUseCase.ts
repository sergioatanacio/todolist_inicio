import { domainError } from '../../../dominio/errores/DomainError'
import { parseAiIntentType } from '../../../dominio/valores_objeto/AiIntentType'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type ProposeAiCommandCommand,
  validateProposeAiCommandCommand,
} from '../../commands/ai/ProposeAiCommandCommand'

export class ProposeAiCommandUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: ProposeAiCommandCommand) {
    const input = validateProposeAiCommandCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')
      const agent = this.aiAgentRepository.findById(conversation.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      const intent = parseAiIntentType(input.intent)
      if (!agent.policy.allows(intent)) {
        throw domainError('FORBIDDEN', 'El intent no esta permitido por la politica del agente')
      }
      const updated = conversation.proposeCommand({
        intent,
        payload: input.payload,
        idempotencyKey: input.idempotencyKey,
      })
      this.aiConversationRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
