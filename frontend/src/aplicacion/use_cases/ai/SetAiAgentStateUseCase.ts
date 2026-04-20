import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import {
  type SetAiAgentStateCommand,
  validateSetAiAgentStateCommand,
} from '../../commands/ai/SetAiAgentStateCommand'

export class SetAiAgentStateUseCase {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: SetAiAgentStateCommand) {
    const input = validateSetAiAgentStateCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const agent = this.aiAgentRepository.findById(input.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      const updated =
        input.action === 'pause'
          ? agent.pause(input.actorUserId)
          : input.action === 'activate'
            ? agent.activate(input.actorUserId)
            : agent.revoke(input.actorUserId)
      this.aiAgentRepository.save(updated)
      await this.eventPublisher.publishFrom(updated)
      return updated
    })
  }
}
