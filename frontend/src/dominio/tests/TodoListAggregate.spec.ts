import { DomainError } from '../errores/DomainError.ts'
import { TodoListAggregate } from '../entidades/TodoListAggregate.ts'

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
    assert(error.code === expectedCode, `Expected ${expectedCode} got ${error.code}`)
  }
}

export const todoListAggregateSpec = () => {
  const list = TodoListAggregate.create('p-1', 'd-1', 1, 'Backlog', '')
  assert(list.orderInDisponibilidad === 1, 'Expected initial list order')
  const moved = list.setOrderInDisponibilidad(3)
  assert(moved.orderInDisponibilidad === 3, 'Expected moved list order')
  const reassigned = moved.reassignDisponibilidad('d-2')
  assert(reassigned.disponibilidadId === 'd-2', 'Expected disponibilidad reassigned')
  assertThrows(() => list.setOrderInDisponibilidad(0), 'VALIDATION_ERROR')
}
