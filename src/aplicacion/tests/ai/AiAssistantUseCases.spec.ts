import { AiAssistantAppService } from '../../AiAssistantAppService.ts'
import { DisponibilidadAppService } from '../../DisponibilidadAppService.ts'
import { ProjectAppService } from '../../ProjectAppService.ts'
import { TaskPlanningAppService } from '../../TaskPlanningAppService.ts'
import { TodoListAppService } from '../../TodoListAppService.ts'
import { DisponibilidadAggregate } from '../../../dominio/entidades/DisponibilidadAggregate.ts'
import { ProjectAggregate, PROJECT_ROLE_IDS } from '../../../dominio/entidades/ProjectAggregate.ts'
import { TaskAggregate } from '../../../dominio/entidades/TaskAggregate.ts'
import { TodoListAggregate } from '../../../dominio/entidades/TodoListAggregate.ts'
import { WorkspaceAggregate } from '../../../dominio/entidades/WorkspaceAggregate.ts'
import type { AnyDomainEvent } from '../../../dominio/eventos/AnyDomainEvent.ts'
import type { AiAgentRepository } from '../../../dominio/puertos/AiAgentRepository.ts'
import type { AiChatGateway } from '../../../dominio/puertos/AiChatGateway.ts'
import type { AiConversationRepository } from '../../../dominio/puertos/AiConversationRepository.ts'
import type { AiCredentialSecretStore } from '../../../dominio/puertos/AiCredentialSecretStore.ts'
import type { AiUserCredentialRepository } from '../../../dominio/puertos/AiUserCredentialRepository.ts'
import type { DisponibilidadRepository } from '../../../dominio/puertos/DisponibilidadRepository.ts'
import type { DomainEventBus } from '../../../dominio/puertos/DomainEventBus.ts'
import type { IdempotencyRepository } from '../../../dominio/puertos/IdempotencyRepository.ts'
import type { ProjectRepository } from '../../../dominio/puertos/ProjectRepository.ts'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository.ts'
import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository.ts'
import type { UnitOfWork } from '../../../dominio/puertos/UnitOfWork.ts'
import type { WorkspaceRepository } from '../../../dominio/puertos/WorkspaceRepository.ts'
import { DomainError } from '../../../dominio/errores/DomainError.ts'
import { AiAgentAggregate } from '../../../dominio/entidades/AiAgentAggregate.ts'
import { AiConversationAggregate } from '../../../dominio/entidades/AiConversationAggregate.ts'
import { AiUserCredentialAggregate } from '../../../dominio/entidades/AiUserCredentialAggregate.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertRejects = async (
  fn: () => Promise<unknown>,
  expectedCode: DomainError['code'],
) => {
  try {
    await fn()
    throw new Error('Expected function to reject')
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw new Error('Expected DomainError')
    }
    assert(error.code === expectedCode, `Expected ${expectedCode} but got ${error.code}`)
  }
}

class InMemoryUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(work: () => T | Promise<T>) {
    return work()
  }
}

class InMemoryDomainEventBus implements DomainEventBus {
  published: AnyDomainEvent[] = []
  publish(event: AnyDomainEvent) {
    this.published.push(event)
  }
  publishMany(events: AnyDomainEvent[]) {
    this.published.push(...events)
  }
}

class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly store = new Map<string, WorkspaceAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByOwnerUserId(ownerUserId: number) {
    return [...this.store.values()].filter((item) => item.ownerUserId === ownerUserId)
  }
  save(workspace: WorkspaceAggregate) {
    this.store.set(workspace.id, workspace)
  }
}

class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, ProjectAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByWorkspaceId(workspaceId: string) {
    return [...this.store.values()].filter((item) => item.workspaceId === workspaceId)
  }
  save(project: ProjectAggregate) {
    this.store.set(project.id, project)
  }
}

class InMemoryDisponibilidadRepository implements DisponibilidadRepository {
  private readonly store = new Map<string, DisponibilidadAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(disponibilidad: DisponibilidadAggregate) {
    this.store.set(disponibilidad.id, disponibilidad)
  }
}

class InMemoryTodoListRepository implements TodoListRepository {
  private readonly store = new Map<string, TodoListAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(todoList: TodoListAggregate) {
    this.store.set(todoList.id, todoList)
  }
}

class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, TaskAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByTodoListId(todoListId: string) {
    return [...this.store.values()].filter((item) => item.todoListId === todoListId)
  }
  findByProjectId(projectId: string) {
    return [...this.store.values()].filter((item) => item.projectId === projectId)
  }
  save(task: TaskAggregate) {
    this.store.set(task.id, task)
  }
}

class InMemoryAiAgentRepository implements AiAgentRepository {
  private readonly store = new Map<string, AiAgentAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByWorkspaceId(workspaceId: string) {
    return [...this.store.values()].filter((item) => item.workspaceId === workspaceId)
  }
  save(agent: AiAgentAggregate) {
    this.store.set(agent.id, agent)
  }
}

class InMemoryAiConversationRepository implements AiConversationRepository {
  private readonly store = new Map<string, AiConversationAggregate>()
  findById(id: string) {
    return this.store.get(id) ?? null
  }
  findByWorkspaceId(workspaceId: string) {
    return [...this.store.values()].filter((item) => item.workspaceId === workspaceId)
  }
  save(conversation: AiConversationAggregate) {
    this.store.set(conversation.id, conversation)
  }
}

class InMemoryAiUserCredentialRepository implements AiUserCredentialRepository {
  private readonly store = new Map<string, AiUserCredentialAggregate>()
  private key(workspaceId: string, userId: number) {
    return `${workspaceId}::${userId}`
  }
  findByWorkspaceAndUser(workspaceId: string, userId: number) {
    return this.store.get(this.key(workspaceId, userId)) ?? null
  }
  save(credential: AiUserCredentialAggregate) {
    this.store.set(
      this.key(credential.workspaceId, credential.userId),
      credential,
    )
  }
}

class InMemoryAiCredentialSecretStore implements AiCredentialSecretStore {
  private readonly store = new Map<string, string>()
  put(data: {
    workspaceId: string
    userId: number
    provider: string
    credentialRef: string
    secret: string
  }) {
    void data.workspaceId
    void data.userId
    void data.provider
    this.store.set(data.credentialRef, data.secret)
  }
  getByCredentialRef(credentialRef: string) {
    return this.store.get(credentialRef) ?? null
  }
  deleteByCredentialRef(credentialRef: string) {
    this.store.delete(credentialRef)
  }
}

class InMemoryAiChatGateway implements AiChatGateway {
  async chat() {
    return {
      assistantMessage: 'ok',
      toolCalls: [],
    }
  }
}

class InMemoryIdempotencyRepository implements IdempotencyRepository {
  private readonly keys = new Set<string>()
  exists(key: string) {
    return this.keys.has(key)
  }
  save(key: string) {
    this.keys.add(key)
  }
}

export const aiAssistantUseCasesAppSpec = async () => {
  const unitOfWork = new InMemoryUnitOfWork()
  const eventBus = new InMemoryDomainEventBus()
  const workspaceRepo = new InMemoryWorkspaceRepository()
  const projectRepo = new InMemoryProjectRepository()
  const disponibilidadRepo = new InMemoryDisponibilidadRepository()
  const todoListRepo = new InMemoryTodoListRepository()
  const taskRepo = new InMemoryTaskRepository()
  const aiAgentRepo = new InMemoryAiAgentRepository()
  const aiConversationRepo = new InMemoryAiConversationRepository()
  const aiUserCredentialRepo = new InMemoryAiUserCredentialRepository()
  const aiSecretStore = new InMemoryAiCredentialSecretStore()
  const aiChatGateway = new InMemoryAiChatGateway()
  const idempotencyRepo = new InMemoryIdempotencyRepository()

  const workspaceBase = WorkspaceAggregate.create(1, 'Workspace AI')
  const workspaceWithMember = workspaceBase.inviteMember(1, 2)
  workspaceRepo.save(workspaceWithMember)

  const projectBase = ProjectAggregate.create(workspaceWithMember.id, 1, 'Proyecto AI', '')
  const project = projectBase.grantAccess({
    actorUserId: 1,
    targetUserId: 2,
    roleId: PROJECT_ROLE_IDS.CONTRIBUTOR,
    targetIsWorkspaceMember: true,
  })
  projectRepo.save(project)

  const disponibilidad = DisponibilidadAggregate.create({
    projectId: project.id,
    name: 'Disponibilidad AI',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    segments: [
      {
        name: 'Maniana',
        startTime: '09:00',
        endTime: '12:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    ],
  })
  disponibilidadRepo.save(disponibilidad)
  const todoList = TodoListAggregate.create(project.id, disponibilidad.id, 1, 'Lista AI', '')
  todoListRepo.save(todoList)

  const projectAppService = new ProjectAppService(
    projectRepo,
    workspaceRepo,
    unitOfWork,
    eventBus,
  )
  const disponibilidadAppService = new DisponibilidadAppService(
    disponibilidadRepo,
    projectRepo,
    workspaceRepo,
    unitOfWork,
    eventBus,
  )
  const todoListAppService = new TodoListAppService(
    todoListRepo,
    workspaceRepo,
    projectRepo,
    disponibilidadRepo,
    unitOfWork,
  )
  const taskPlanningAppService = new TaskPlanningAppService(
    taskRepo,
    todoListRepo,
    disponibilidadRepo,
    projectRepo,
    workspaceRepo,
    unitOfWork,
  )

  const aiService = new AiAssistantAppService(
    aiAgentRepo,
    aiConversationRepo,
    aiUserCredentialRepo,
    aiSecretStore,
    aiChatGateway,
    idempotencyRepo,
    workspaceRepo,
    projectRepo,
    unitOfWork,
    eventBus,
    projectAppService,
    todoListAppService,
    disponibilidadAppService,
    taskPlanningAppService,
  )

  await aiService.registerUserCredential({
    workspaceId: workspaceWithMember.id,
    userId: 2,
    actorUserId: 2,
    provider: 'openai',
    credentialRef: 'user2-ref-12345',
  })
  await aiService.setUserCredentialSecret({
    workspaceId: workspaceWithMember.id,
    userId: 2,
    actorUserId: 2,
    secret: 'token-user-2',
  })

  const agent = await aiService.createAgent({
    workspaceId: workspaceWithMember.id,
    actorUserId: 1,
    provider: 'openai',
    model: 'gpt-5',
    policy: {
      allowedIntents: ['CREATE_TASK', 'READ_TASKS_DUE_TOMORROW', 'ADD_TASK_COMMENT'],
      requireApprovalForWrites: true,
    },
  })

  const conversation = await aiService.startConversation({
    workspaceId: workspaceWithMember.id,
    projectId: project.id,
    actorUserId: 2,
    agentId: agent.id,
  })

  let proposed = await aiService.proposeCommand({
    conversationId: conversation.id,
    actorUserId: 2,
    intent: 'CREATE_TASK',
    payload: { todoListId: todoList.id, title: 'Tarea IA', durationMinutes: 30 },
    idempotencyKey: 'ai-create-task-001',
  })
  const createTaskCommand = proposed.commands.find((cmd) => cmd.intent === 'CREATE_TASK')!
  assert(createTaskCommand.requiresApproval, 'Write intents should require approval')

  await assertRejects(
    () =>
      aiService.executeCommand({
        conversationId: conversation.id,
        commandId: createTaskCommand.id,
        actorUserId: 2,
      }),
    'INVALID_STATE',
  )

  proposed = await aiService.approveCommand({
    conversationId: conversation.id,
    commandId: createTaskCommand.id,
    actorUserId: 2,
  })
  const executeResult = await aiService.executeCommand({
    conversationId: conversation.id,
    commandId: createTaskCommand.id,
    actorUserId: 2,
  })
  assert(executeResult.kind === 'mutated', 'Expected mutation result on CREATE_TASK')
  assert(taskRepo.findByTodoListId(todoList.id).length >= 1, 'Task should be created')

  await assertRejects(
    () =>
      aiService.executeCommand({
        conversationId: conversation.id,
        commandId: createTaskCommand.id,
        actorUserId: 2,
      }),
    'DUPLICATE',
  )

  const proposedRead = await aiService.proposeCommand({
    conversationId: conversation.id,
    actorUserId: 2,
    intent: 'READ_TASKS_DUE_TOMORROW',
    payload: {},
    idempotencyKey: 'ai-read-001',
  })
  const readCommand = proposedRead.commands.find(
    (cmd) => cmd.intent === 'READ_TASKS_DUE_TOMORROW',
  )!
  const readResult = await aiService.executeCommand({
    conversationId: conversation.id,
    commandId: readCommand.id,
    actorUserId: 2,
  })
  assert(readResult.kind === 'query', 'Read intent should return query result')

  const proposedComment = await aiService.proposeCommand({
    conversationId: conversation.id,
    actorUserId: 2,
    intent: 'ADD_TASK_COMMENT',
    payload: { taskId: 't1', comment: 'hola' },
    idempotencyKey: 'ai-comment-001',
  })
  const commentCommand = proposedComment.commands.find((cmd) => cmd.intent === 'ADD_TASK_COMMENT')!
  await aiService.approveCommand({
    conversationId: conversation.id,
    commandId: commentCommand.id,
    actorUserId: 2,
  })
  await assertRejects(
    () =>
      aiService.executeCommand({
        conversationId: conversation.id,
        commandId: commentCommand.id,
        actorUserId: 2,
      }),
    'CONFLICT',
  )

  const rotatedCredential = await aiService.rotateUserCredential({
    workspaceId: workspaceWithMember.id,
    userId: 2,
    actorUserId: 2,
    credentialRef: 'user2-ref-67890',
  })
  assert(rotatedCredential.credentialRef === 'user2-ref-67890', 'Credential should rotate')

  await aiService.revokeUserCredential({
    workspaceId: workspaceWithMember.id,
    userId: 2,
    actorUserId: 2,
  })
  const afterRevokeProposal = await aiService.proposeCommand({
    conversationId: conversation.id,
    actorUserId: 2,
    intent: 'READ_TASKS_DUE_TOMORROW',
    payload: {},
    idempotencyKey: 'ai-read-after-revoke-001',
  })
  const afterRevokeRead = afterRevokeProposal.commands.find(
    (cmd) => cmd.idempotencyKey === 'ai-read-after-revoke-001',
  )!
  await assertRejects(
    () =>
      aiService.executeCommand({
        conversationId: conversation.id,
        commandId: afterRevokeRead.id,
        actorUserId: 2,
      }),
    'FORBIDDEN',
  )
}
