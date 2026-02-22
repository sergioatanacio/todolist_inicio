import type { DomainEventBus } from '../dominio/puertos/DomainEventBus'
import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'
import { DomainEventPublisher } from '../dominio/servicios/DomainEventPublisher'
import { AssignWorkspaceRoleUseCase } from './use_cases/workspace/AssignWorkspaceRoleUseCase'
import { CreateWorkspaceUseCase } from './use_cases/workspace/CreateWorkspaceUseCase'
import { InviteWorkspaceMemberUseCase } from './use_cases/workspace/InviteWorkspaceMemberUseCase'
import { TransferWorkspaceOwnershipUseCase } from './use_cases/workspace/TransferWorkspaceOwnershipUseCase'
import type { CreateWorkspaceCommand } from './commands/workspace/CreateWorkspaceCommand'
import type { InviteWorkspaceMemberCommand } from './commands/workspace/InviteWorkspaceMemberCommand'
import type { AssignWorkspaceRoleCommand } from './commands/workspace/AssignWorkspaceRoleCommand'
import type { TransferWorkspaceOwnershipCommand } from './commands/workspace/TransferWorkspaceOwnershipCommand'

export class WorkspaceAppService {
  private readonly createWorkspaceUseCase: CreateWorkspaceUseCase
  private readonly inviteWorkspaceMemberUseCase: InviteWorkspaceMemberUseCase
  private readonly assignWorkspaceRoleUseCase: AssignWorkspaceRoleUseCase
  private readonly transferWorkspaceOwnershipUseCase: TransferWorkspaceOwnershipUseCase

  constructor(
    workspaceRepository: WorkspaceRepository,
    unitOfWork: UnitOfWork,
    eventBus: DomainEventBus,
  ) {
    const eventPublisher = new DomainEventPublisher(eventBus)
    this.createWorkspaceUseCase = new CreateWorkspaceUseCase(
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.inviteWorkspaceMemberUseCase = new InviteWorkspaceMemberUseCase(
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.assignWorkspaceRoleUseCase = new AssignWorkspaceRoleUseCase(
      workspaceRepository,
      unitOfWork,
      eventPublisher,
    )
    this.transferWorkspaceOwnershipUseCase =
      new TransferWorkspaceOwnershipUseCase(
        workspaceRepository,
        unitOfWork,
        eventPublisher,
      )
  }

  createWorkspace(command: CreateWorkspaceCommand) {
    return this.createWorkspaceUseCase.execute(command)
  }

  inviteMember(command: InviteWorkspaceMemberCommand) {
    return this.inviteWorkspaceMemberUseCase.execute(command)
  }

  assignRole(command: AssignWorkspaceRoleCommand) {
    return this.assignWorkspaceRoleUseCase.execute(command)
  }

  transferOwnership(command: TransferWorkspaceOwnershipCommand) {
    return this.transferWorkspaceOwnershipUseCase.execute(command)
  }
}
