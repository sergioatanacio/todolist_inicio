import { DomainError } from '../errores/DomainError.ts'
import { WorkspaceConversationAggregate } from '../entidades/WorkspaceConversationAggregate.ts'

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

export const workspaceConversationAggregateSpec = () => {
  const conversation = WorkspaceConversationAggregate.create('ws-1')
  const withRoot = conversation.addMessage(1, 'Mensaje raiz')
  const root = withRoot.messages[0]
  const withReply = withRoot.addMessage(2, 'Respuesta', root.id)
  assert(withReply.messages.length === 2, 'Expected two messages')

  assertThrows(() => withReply.editMessage(3, root.id, 'hack'), 'FORBIDDEN')
}
