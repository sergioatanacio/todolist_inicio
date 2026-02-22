import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { parseAiIntentType } from '../../../dominio/valores_objeto/AiIntentType'
import {
  type UpdateAiAgentPolicyCommand,
  validateUpdateAiAgentPolicyCommand,
} from '../../commands/ai/UpdateAiAgentPolicyCommand'

export class UpdateAiAgentPolicyUseCase {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateAiAgentPolicyCommand) {
    const input = validateUpdateAiAgentPolicyCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const agent = this.aiAgentRepository.findById(input.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      const updated = agent.updatePolicy(input.actorUserId, {
        allowedIntents: input.policy.allowedIntents.map((item) => parseAiIntentType(item)),
        requireApprovalForWrites: input.policy.requireApprovalForWrites,
      })
      this.aiAgentRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
