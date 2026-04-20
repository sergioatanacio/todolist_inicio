import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import {
  type DeleteAiAgentCommand,
  validateDeleteAiAgentCommand,
} from '../../commands/ai/DeleteAiAgentCommand'

export class DeleteAiAgentUseCase {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  execute(command: DeleteAiAgentCommand) {
    const input = validateDeleteAiAgentCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const agent = this.aiAgentRepository.findById(input.agentId)
      if (!agent) throw domainError('NOT_FOUND', 'Agente IA no encontrado')
      this.aiAgentRepository.delete(agent.id)
      return { id: agent.id }
    })
  }
}

