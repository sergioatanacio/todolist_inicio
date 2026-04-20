import { domainError } from '../../../dominio/errores/DomainError'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type AddAiUserMessageCommand,
  validateAddAiUserMessageCommand,
} from '../../commands/ai/AddAiUserMessageCommand'

export class AddAiUserMessageUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: AddAiUserMessageCommand) {
    const input = validateAddAiUserMessageCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')
      const updated = conversation.addUserMessage(input.actorUserId, input.message)
      this.aiConversationRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
