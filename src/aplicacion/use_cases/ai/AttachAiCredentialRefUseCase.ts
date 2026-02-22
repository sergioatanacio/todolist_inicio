import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type AttachAiCredentialRefCommand,
  validateAttachAiCredentialRefCommand,
} from '../../commands/ai/AttachAiCredentialRefCommand'

export class AttachAiCredentialRefUseCase {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: AttachAiCredentialRefCommand) {
    const input = validateAttachAiCredentialRefCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const agent = this.aiAgentRepository.findById(input.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      const updated = agent.attachCredentialRef(input.actorUserId, input.credentialRef)
      this.aiAgentRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
