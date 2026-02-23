import { DomainError } from '../errores/DomainError.ts'
import { AiAgentAggregate } from '../entidades/AiAgentAggregate.ts'

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

export const aiAgentAggregateSpec = () => {
  const agent = AiAgentAggregate.create({
    workspaceId: 'ws-1',
    createdByUserId: 1,
    provider: 'openai',
    model: 'gpt-5',
  })
  assert(agent.state === 'ACTIVE', 'Agent should start active')

  const paused = agent.pause(1)
  assert(paused.state === 'PAUSED', 'Agent should pause')

  const activeAgain = paused.activate(1)
  assert(activeAgain.state === 'ACTIVE', 'Agent should reactivate')

  const revoked = activeAgain.revoke(1)
  assert(revoked.state === 'REVOKED', 'Agent should be revoked')
  assertThrows(() => revoked.updatePolicy(1, { allowedIntents: ['CREATE_TASK'] }), 'INVALID_STATE')
}
