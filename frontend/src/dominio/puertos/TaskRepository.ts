import type { TaskAggregate } from '../entidades/TaskAggregate'

export interface TaskRepository {
  findById(id: string): TaskAggregate | null
  findByTodoListId(todoListId: string): TaskAggregate[]
  findByProjectId(projectId: string): TaskAggregate[]
  save(task: TaskAggregate): void
}
