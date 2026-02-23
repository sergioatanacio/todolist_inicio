import { DomainError } from '../errores/DomainError.ts'
import { AiUserCredentialAggregate } from '../entidades/AiUserCredentialAggregate.ts'

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

export const aiUserCredentialAggregateSpec = () => {
  const credential = AiUserCredentialAggregate.register({
    workspaceId: 'ws-1',
    userId: 10,
    provider: 'openai',
    credentialRef: 'secret-ref-12345',
    actorUserId: 10,
  })

  assert(credential.state === 'ACTIVE', 'Credential should start active')
  assert(credential.userId === 10, 'Credential should belong to the expected user')

  const rotated = credential.rotate(10, 'secret-ref-67890')
  assert(rotated.state === 'ACTIVE', 'Rotate keeps credential active')
  assert(rotated.credentialRef === 'secret-ref-67890', 'Rotate updates credential reference')

  const revoked = rotated.revoke(10)
  assert(revoked.state === 'REVOKED', 'Credential should be revoked')
  assertThrows(() => revoked.rotate(10, 'secret-ref-99999'), 'INVALID_TRANSITION')
}
