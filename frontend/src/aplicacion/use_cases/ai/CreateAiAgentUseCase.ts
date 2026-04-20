import { domainError } from '../../../dominio/errores/DomainError'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository'
import { AiCredentialAuthorizationPolicy } from '../../../dominio/servicios/AiCredentialAuthorizationPolicy'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher'
import { AiAgentAggregate } from '../../../dominio/entidades/AiAgentAggregate'
import { parseAiIntentType } from '../../../dominio/valores_objeto/AiIntentType'
import {
  type CreateAiAgentCommand,
  validateCreateAiAgentCommand,
} from '../../commands/ai/CreateAiAgentCommand'

export class CreateAiAgentUseCase {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateAiAgentCommand) {
    const input = validateCreateAiAgentCommand(command)
    return this.unitOfWork.runInTransaction(async () => {
      const workspace = this.workspaceRepository.findById(input.workspaceId)
      if (!workspace) throw domainError('NOT_FOUND', 'Workspace no encontrado')
      AiCredentialAuthorizationPolicy.ensureActiveMember(
        workspace,
        input.actorUserId,
        'El actor no pertenece al workspace',
      )
      const agent = AiAgentAggregate.create({
        workspaceId: input.workspaceId,
        createdByUserId: input.actorUserId,
        provider: input.provider,
        model: input.model,
        policy: input.policy
          ? {
              allowedIntents: input.policy.allowedIntents.map((item) => parseAiIntentType(item)),
              requireApprovalForWrites: input.policy.requireApprovalForWrites,
            }
          : undefined,
      })
      this.aiAgentRepository.save(agent)
      await this.eventPublisher.publishFrom(agent)
      return agent
    })
  }
}
