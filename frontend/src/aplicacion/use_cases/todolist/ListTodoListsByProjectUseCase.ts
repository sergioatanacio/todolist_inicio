import type { TodoListRepository } from '../../../dominio/puertos/TodoListRepository'

type ListTodoListsByProjectInput = {
  projectId: string
}

export class ListTodoListsByProjectUseCase {
  constructor(private readonly todoListRepository: TodoListRepository) {}

  execute(input: ListTodoListsByProjectInput) {
    return this.todoListRepository.findByProjectId(input.projectId)
  }
}
