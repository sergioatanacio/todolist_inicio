import { domainError } from '../../../dominio/errores/DomainError'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type ApproveAiCommandCommand,
  validateApproveAiCommandCommand,
} from '../../commands/ai/ApproveAiCommandCommand'

export class ApproveAiCommandUseCase {
  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: ApproveAiCommandCommand) {
    const input = validateApproveAiCommandCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const conversation = this.aiConversationRepository.findById(input.conversationId)
      if (!conversation) throw domainError('NOT_FOUND', 'Conversacion IA no encontrada')
      const updated = conversation.approveCommand(input.commandId, input.actorUserId)
      this.aiConversationRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
