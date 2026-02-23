import type { Database } from 'sql.js'
import { AuthService } from '../dominio/servicios/AuthService'
import { UserAggregate } from '../dominio/entidades/UserAggregate'
import { AuthAppService } from './AuthAppService'
import { TodoAppService } from './TodoAppService'
import { WorkspaceAppService } from './WorkspaceAppService'
import { ProjectAppService } from './ProjectAppService'
import { DisponibilidadAppService } from './DisponibilidadAppService'
import { TodoListAppService } from './TodoListAppService'
import { TaskPlanningAppService } from './TaskPlanningAppService'
import { AiAssistantAppService } from './AiAssistantAppService'
import { SqliteUserRepository } from '../infra/SqliteUserRepository'
import { SqliteTodoRepository } from '../infra/SqliteTodoRepository'
import { SqliteWorkspaceRepository } from '../infra/SqliteWorkspaceRepository'
import { SqliteProjectRepository } from '../infra/SqliteProjectRepository'
import { SqliteDisponibilidadRepository } from '../infra/SqliteDisponibilidadRepository'
import { SqliteTodoListRepository } from '../infra/SqliteTodoListRepository'
import { SqliteTaskRepository } from '../infra/SqliteTaskRepository'
import { SqliteAiAgentRepository } from '../infra/SqliteAiAgentRepository'
import { SqliteAiConversationRepository } from '../infra/SqliteAiConversationRepository'
import { SqliteAiUserCredentialRepository } from '../infra/SqliteAiUserCredentialRepository'
import { SqliteIdempotencyRepository } from '../infra/SqliteIdempotencyRepository'
import { OpenAiChatGateway } from '../infra/ai/OpenAiChatGateway'
import { SqliteAiSecretStore } from '../infra/ai/SqliteAiSecretStore'
import { InMemoryDomainEventBus } from '../infra/InMemoryDomainEventBus'
import { NoopUnitOfWork } from '../infra/NoopUnitOfWork'
import type { TodoAggregate } from '../dominio/entidades/TodoAggregate'

export type AppServices = {
  auth: AuthAppService
  todos: TodoAppService
  workspace: WorkspaceAppService
  project: ProjectAppService
  disponibilidad: DisponibilidadAppService
  todoList: TodoListAppService
  taskPlanning: TaskPlanningAppService
  aiAssistant: AiAssistantAppService
}

export const createAppServices = (
  db: Database,
  persist: (db: Database) => Promise<void>,
): AppServices => {
  const authService = new AuthService()
  const userRepo = new SqliteUserRepository(db, persist)
  const todoRepo = new SqliteTodoRepository(db, persist)
  const workspaceRepo = new SqliteWorkspaceRepository(db, persist)
  const projectRepo = new SqliteProjectRepository(db, persist)
  const disponibilidadRepo = new SqliteDisponibilidadRepository(db, persist)
  const todoListRepo = new SqliteTodoListRepository(db, persist)
  const taskRepo = new SqliteTaskRepository(db, persist)
  const aiAgentRepo = new SqliteAiAgentRepository(db, persist)
  const aiConversationRepo = new SqliteAiConversationRepository(db, persist)
  const aiUserCredentialRepo = new SqliteAiUserCredentialRepository(db, persist)
  const idempotencyRepo = new SqliteIdempotencyRepository(db, persist)
  const aiSecretStore = new SqliteAiSecretStore(db, persist)
  const aiChatGateway = new OpenAiChatGateway()
  const eventBus = new InMemoryDomainEventBus()
  const unitOfWork = new NoopUnitOfWork()
  const project = new ProjectAppService(
    projectRepo,
    workspaceRepo,
    unitOfWork,
    eventBus,
  )
  const disponibilidad = new DisponibilidadAppService(
    disponibilidadRepo,
    projectRepo,
    workspaceRepo,
    unitOfWork,
    eventBus,
  )
  const todoList = new TodoListAppService(
    todoListRepo,
    workspaceRepo,
    projectRepo,
    disponibilidadRepo,
    unitOfWork,
  )
  const taskPlanning = new TaskPlanningAppService(
    taskRepo,
    todoListRepo,
    disponibilidadRepo,
    projectRepo,
    workspaceRepo,
    unitOfWork,
  )
  const aiAssistant = new AiAssistantAppService(
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
    project,
    todoList,
    disponibilidad,
    taskPlanning,
  )
  return {
    auth: new AuthAppService(authService, userRepo),
    todos: new TodoAppService(todoRepo),
    workspace: new WorkspaceAppService(workspaceRepo, unitOfWork, eventBus),
    project,
    disponibilidad,
    todoList,
    taskPlanning,
    aiAssistant,
  }
}

export const restoreSession = (
  services: AppServices,
  userId: number,
): { user: UserAggregate; todos: TodoAggregate[] } | null => {
  const record = services.auth.restoreSession(userId)
  if (!record) return null
  const user = UserAggregate.rehydrate(record)
  const todos = services.todos.listByUser(user.id)
  return { user, todos }
}
