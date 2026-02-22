import { DomainError } from '../errores/DomainError.ts'
import { TaskAggregate } from '../entidades/TaskAggregate.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertThrows = (fn: () => void, expectedCode: DomainError['code']) => {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw new Error('Expected DomainError')
    }
    assert(
      error.code === expectedCode,
      `Expected code ${expectedCode} but got ${error.code}`,
    )
  }
}

export const taskAggregateSpec = () => {
  const task = TaskAggregate.create({
    projectId: 'p-1',
    todoListId: 'l-1',
    title: 'Implementar dominio',
    createdByUserId: 1,
  })
  assert(task.durationMinutes > 0, 'Task duration must be greater than 0')

  const inProgress = task.changeStatus(1, 'IN_PROGRESS')
  const done = inProgress.changeStatus(1, 'DONE')
  assert(done.status === 'DONE', 'Task status must be DONE')

  assertThrows(() => done.changeStatus(1, 'PENDING'), 'INVALID_TRANSITION')

  const withComment = done.addComment(1, 'Primer comentario')
  const rootComment = withComment.comments[0]
  const withReply = withComment.addComment(1, 'Respuesta', rootComment.id)
  assert(withReply.comments.length === 2, 'Task must contain two comments')
}
