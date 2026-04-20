import { TodoAggregate } from '../dominio/entidades/TodoAggregate'
import { SqliteTodoRepository } from '../infra/SqliteTodoRepository'

export class TodoAppService {
  constructor(private readonly todoRepo: SqliteTodoRepository) {}

  listByUser(userId: number) {
    return this.todoRepo.findByUserId(userId)
  }

  async add(userId: number, text: string) {
    const todo = TodoAggregate.create(userId, text, 30)
    await this.todoRepo.add(todo)
    return todo
  }

  async toggle(todo: TodoAggregate) {
    const updated = todo.toggle()
    await this.todoRepo.update(updated)
    return updated
  }

  async remove(id: string, userId: number) {
    await this.todoRepo.remove(id, userId)
  }

  async clearCompleted(userId: number) {
    await this.todoRepo.clearCompleted(userId)
  }
}
