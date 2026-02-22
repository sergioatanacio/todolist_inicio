import { domainError } from '../../../dominio/errores/DomainError'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type CloseAiConversationCommand,
  validateCloseAiConversationCommand,
} from '../../commands/ai/CloseAiConversationCommand'

export class CloseAiConversationUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CloseAiConversationCommand) {
    const input = validateCloseAiConversationCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')
      const updated = conversation.close(input.actorUserId)
      this.aiConversationRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
