import type { Database } from 'sql.js'
import { AuthService } from '../dominio/servicios/AuthService'
import { UserAggregate } from '../dominio/entidades/UserAggregate'
import { AuthAppService } from './AuthAppService'
import { TodoAppService } from './TodoAppService'
import { WorkspaceAppService } from './WorkspaceAppService'
import { SqliteUserRepository } from '../infra/SqliteUserRepository'
import { SqliteTodoRepository } from '../infra/SqliteTodoRepository'
import { InMemoryWorkspaceRepository } from '../infra/InMemoryWorkspaceRepository'
import { InMemoryDomainEventBus } from '../infra/InMemoryDomainEventBus'
import { NoopUnitOfWork } from '../infra/NoopUnitOfWork'
import type { TodoAggregate } from '../dominio/entidades/TodoAggregate'

export type AppServices = {
  auth: AuthAppService
  todos: TodoAppService
  workspace: WorkspaceAppService
}

export const createAppServices = (
  db: Database,
  persist: (db: Database) => Promise<void>,
): AppServices => {
  const authService = new AuthService()
  const userRepo = new SqliteUserRepository(db, persist)
  const todoRepo = new SqliteTodoRepository(db, persist)
  const workspaceRepo = new InMemoryWorkspaceRepository()
  const eventBus = new InMemoryDomainEventBus()
  const unitOfWork = new NoopUnitOfWork()
  return {
    auth: new AuthAppService(authService, userRepo),
    todos: new TodoAppService(todoRepo),
    workspace: new WorkspaceAppService(workspaceRepo, unitOfWork, eventBus),
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
