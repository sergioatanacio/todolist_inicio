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
  assert(task.statusHistory.length === 0, 'Task must start without status history')
  assert(task.orderInList === 1, 'Task should start with order 1 by default')

  const reordered = task.setOrderInList(1, 4)
  assert(reordered.orderInList === 4, 'Task order should be updated')

  const inProgress = reordered.changeStatus(1, 'IN_PROGRESS')
  assert(inProgress.status === 'IN_PROGRESS', 'Task should move to IN_PROGRESS')
  assert(
    inProgress.statusHistory.length === 1,
    'Status history must append exactly one record per transition',
  )

  const done = inProgress.changeStatus(1, 'DONE')
  assert(done.status === 'DONE', 'Task status must be DONE')
  assert(done.statusHistory.length === 2, 'Task history should contain two entries')

  const doneAgain = done.changeStatus(1, 'DONE')
  assert(doneAgain === done, 'No-op status change should return same aggregate')
  assert(
    doneAgain.statusHistory.length === 2,
    'No-op status change must not append status history',
  )

  assertThrows(() => done.changeStatus(1, 'PENDING'), 'INVALID_TRANSITION')

  const reopened = done.toggleDone(1)
  assert(
    reopened.status === 'IN_PROGRESS',
    'toggleDone from DONE must return IN_PROGRESS',
  )
  const closedAgain = reopened.toggleDone(1)
  assert(closedAgain.status === 'DONE', 'toggleDone must return DONE when not DONE')

  const statusEvents = closedAgain
    .pullDomainEvents()
    .filter((event) => event.type === 'task.status_changed')
  assert(
    statusEvents.length === 4,
    'Status events should be emitted only for real status transitions',
  )

  const withComment = done.addComment(1, 'Primer comentario')
  const rootComment = withComment.comments[0]
  const withReply = withComment.addComment(1, 'Respuesta', rootComment.id)
  assert(withReply.comments.length === 2, 'Task must contain two comments')
  const withDeletedRoot = withReply.deleteComment(1, rootComment.id)
  assertThrows(
    () => withDeletedRoot.addComment(1, 'No permitido', rootComment.id),
    'INVALID_STATE',
  )

  const rehydrated = TaskAggregate.rehydrate(closedAgain.toPrimitives())
  assert(
    rehydrated.status === closedAgain.status,
    'Rehydrated task must keep the same status',
  )
  assert(
    rehydrated.statusHistory.length === closedAgain.statusHistory.length,
    'Rehydrated task must keep status history',
  )

  const invalidCommentSnapshot = withDeletedRoot.toPrimitives()
  const replyToDeleted = invalidCommentSnapshot.comments.find(
    (comment) => comment.parentCommentId === rootComment.id,
  )
  if (replyToDeleted) {
    invalidCommentSnapshot.comments = invalidCommentSnapshot.comments.filter(
      (comment) => comment.id !== replyToDeleted.id,
    )
  }
  invalidCommentSnapshot.comments.push({
    id: 'invalid-reply',
    authorUserId: 1,
    body: 'Respuesta invalida',
    parentCommentId: rootComment.id,
    createdAt: Date.now(),
    updatedAt: null,
    deletedAt: null,
  })
  assertThrows(
    () => TaskAggregate.rehydrate(invalidCommentSnapshot),
    'INVALID_STATE',
  )
}
