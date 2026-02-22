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
import { SqliteUserRepository } from '../infra/SqliteUserRepository'
import { SqliteTodoRepository } from '../infra/SqliteTodoRepository'
import { SqliteWorkspaceRepository } from '../infra/SqliteWorkspaceRepository'
import { SqliteProjectRepository } from '../infra/SqliteProjectRepository'
import { SqliteDisponibilidadRepository } from '../infra/SqliteDisponibilidadRepository'
import { SqliteTodoListRepository } from '../infra/SqliteTodoListRepository'
import { SqliteTaskRepository } from '../infra/SqliteTaskRepository'
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
  const eventBus = new InMemoryDomainEventBus()
  const unitOfWork = new NoopUnitOfWork()
  return {
    auth: new AuthAppService(authService, userRepo),
    todos: new TodoAppService(todoRepo),
    workspace: new WorkspaceAppService(workspaceRepo, unitOfWork, eventBus),
    project: new ProjectAppService(
      projectRepo,
      workspaceRepo,
      unitOfWork,
      eventBus,
    ),
    disponibilidad: new DisponibilidadAppService(
      disponibilidadRepo,
      projectRepo,
      workspaceRepo,
      unitOfWork,
      eventBus,
    ),
    todoList: new TodoListAppService(
      todoListRepo,
      workspaceRepo,
      projectRepo,
      disponibilidadRepo,
      unitOfWork,
    ),
    taskPlanning: new TaskPlanningAppService(
      taskRepo,
      todoListRepo,
      disponibilidadRepo,
      projectRepo,
      workspaceRepo,
      unitOfWork,
    ),
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
