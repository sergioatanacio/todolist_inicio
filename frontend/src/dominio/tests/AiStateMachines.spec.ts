import { DomainError } from '../errores/DomainError.ts'
import { transitionAiAgent } from '../maquinas/ai/AiAgentStateMachine.ts'
import { transitionAiCommand } from '../maquinas/ai/AiCommandStateMachine.ts'
import { transitionAiConversation } from '../maquinas/ai/AiConversationStateMachine.ts'

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
    assert(error.code === expectedCode, `Expected ${expectedCode} but got ${error.code}`)
  }
}

export const aiStateMachinesSpec = () => {
  assert(transitionAiAgent('ACTIVE', 'PAUSE') === 'PAUSED', 'Agent should pause')
  assert(transitionAiConversation('OPEN', 'CLOSE') === 'CLOSED', 'Conversation should close')
  assert(transitionAiCommand('PROPOSED', 'APPROVE') === 'APPROVED', 'Command should approve')
  assertThrows(() => transitionAiAgent('REVOKED', 'ACTIVATE'), 'INVALID_TRANSITION')
}
