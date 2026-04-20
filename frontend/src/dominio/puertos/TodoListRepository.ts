import type { TodoListAggregate } from '../entidades/TodoListAggregate'

export interface TodoListRepository {
  findById(id: string): TodoListAggregate | null
  findByProjectId(projectId: string): TodoListAggregate[]
  save(todoList: TodoListAggregate): void
}
