import type { TaskStatus } from '../../../dominio/valores_objeto/TaskStatus'
import type { TaskRepository } from '../../../dominio/puertos/TaskRepository'

type GetKanbanByTodoListInput = {
  todoListId: string
}

export class GetKanbanByTodoListUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(input: GetKanbanByTodoListInput) {
    const tasks = this.taskRepository
      .findByTodoListId(input.todoListId)
      .sort((a, b) => a.orderInList - b.orderInList)
    const columns: Record<TaskStatus, typeof tasks> = {
      PENDING: [],
      IN_PROGRESS: [],
      DONE: [],
      ABANDONED: [],
    }
    for (const task of tasks) {
      columns[task.status].push(task)
    }
    return columns
  }
}
