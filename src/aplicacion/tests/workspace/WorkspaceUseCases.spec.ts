import { AssignWorkspaceRoleUseCase } from '../../use_cases/workspace/AssignWorkspaceRoleUseCase.ts'
import { CreateWorkspaceUseCase } from '../../use_cases/workspace/CreateWorkspaceUseCase.ts'
import { InviteWorkspaceMemberUseCase } from '../../use_cases/workspace/InviteWorkspaceMemberUseCase.ts'
import { TransferWorkspaceOwnershipUseCase } from '../../use_cases/workspace/TransferWorkspaceOwnershipUseCase.ts'
import type { WorkspaceAggregate } from '../../../dominio/entidades/WorkspaceAggregate.ts'
import type { AnyDomainEvent } from '../../../dominio/eventos/AnyDomainEvent.ts'
import { DomainEventPublisher } from '../../../dominio/servicios/DomainEventPublisher.ts'
import type { DomainEventBus } from '../../../dominio/puertos/DomainEventBus.ts'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork.ts'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly store = new Map<string, WorkspaceAggregate>()
  findByIdCalls = 0
  saveCalls = 0

  findById(id: string) {
    this.findByIdCalls += 1
    return this.store.get(id) ?? null
  }

  save(workspace: WorkspaceAggregate) {
    this.saveCalls += 1
    this.store.set(workspace.id, workspace)
  }
}

class InMemoryDomainEventBus implements DomainEventBus {
  readonly published: AnyDomainEvent[] = []

  publish(event: AnyDomainEvent) {
    this.published.push(event)
  }

  publishMany(events: AnyDomainEvent[]) {
    this.published.push(...events)
  }
}

class InMemoryUnitOfWork implements UnitOfWork {
  runCalls = 0

  async runInTransaction<T>(work: () => T | Promise<T>) {
    this.runCalls += 1
    return work()
  }
}

const makeDeps = () => {
  const repository = new InMemoryWorkspaceRepository()
  const bus = new InMemoryDomainEventBus()
  const unitOfWork = new InMemoryUnitOfWork()
  const publisher = new DomainEventPublisher(bus)
  return { repository, bus, unitOfWork, publisher }
}

export const workspaceUseCasesAppSpec = async () => {
  {
    const deps = makeDeps()
    const useCase = new CreateWorkspaceUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const created = await useCase.execute({ ownerUserId: 1, name: 'Alpha' })
    const fromRepo = deps.repository.findById(created.id)
    assert(fromRepo !== null, 'Create must persist workspace')
    assert(deps.unitOfWork.runCalls === 1, 'Create must run in transaction')
    assert(deps.repository.saveCalls === 1, 'Create must save workspace')
    assert(
      deps.bus.published.some((event) => event.type === 'workspace.created'),
      'Create must publish workspace.created',
    )
  }

  {
    const deps = makeDeps()
    const create = new CreateWorkspaceUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const invite = new InviteWorkspaceMemberUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const created = await create.execute({ ownerUserId: 10, name: 'Beta' })
    const invited = await invite.execute({
      workspaceId: created.id,
      actorUserId: 10,
      targetUserId: 20,
    })
    assert(invited.members.some((member) => member.userId === 20), 'Invite must apply rule')
    assert(deps.repository.findByIdCalls >= 1, 'Invite must load workspace')
    assert(deps.repository.saveCalls >= 2, 'Invite must save updated workspace')
    assert(
      deps.bus.published.some((event) => event.type === 'workspace.member_added'),
      'Invite must publish workspace.member_added',
    )
  }

  {
    const deps = makeDeps()
    const create = new CreateWorkspaceUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const invite = new InviteWorkspaceMemberUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const assign = new AssignWorkspaceRoleUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const created = await create.execute({ ownerUserId: 100, name: 'Gamma' })
    await invite.execute({
      workspaceId: created.id,
      actorUserId: 100,
      targetUserId: 200,
    })
    const updated = await assign.execute({
      workspaceId: created.id,
      actorUserId: 100,
      targetUserId: 200,
      roleId: 'admin',
    })
    const assignment = updated.assignments.find((entry) => entry.userId === 200)
    assert(assignment?.roleIds.includes('admin') ?? false, 'Assign must apply role')
    assert(
      deps.bus.published.some((event) => event.type === 'workspace.role_assigned'),
      'Assign must publish workspace.role_assigned',
    )
  }

  {
    const deps = makeDeps()
    const create = new CreateWorkspaceUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const invite = new InviteWorkspaceMemberUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const transfer = new TransferWorkspaceOwnershipUseCase(
      deps.repository,
      deps.unitOfWork,
      deps.publisher,
    )
    const created = await create.execute({ ownerUserId: 7, name: 'Delta' })
    await invite.execute({
      workspaceId: created.id,
      actorUserId: 7,
      targetUserId: 8,
    })
    const transferred = await transfer.execute({
      workspaceId: created.id,
      actorUserId: 7,
      nextOwnerUserId: 8,
    })
    assert(transferred.ownerUserId === 8, 'Transfer must apply ownership rule')
    assert(deps.repository.findByIdCalls >= 1, 'Transfer must load workspace')
    assert(
      deps.bus.published.some(
        (event) => event.type === 'workspace.ownership_transferred',
      ),
      'Transfer must publish workspace.ownership_transferred',
    )
  }
}
