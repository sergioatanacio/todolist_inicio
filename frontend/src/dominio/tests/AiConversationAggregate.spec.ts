import { DomainError } from '../errores/DomainError.ts'
import { AiConversationAggregate } from '../entidades/AiConversationAggregate.ts'

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

export const aiConversationAggregateSpec = () => {
  const conversation = AiConversationAggregate.start({
    workspaceId: 'ws-1',
    projectId: 'prj-1',
    initiatorUserId: 1,
    agentId: 'agent-1',
  })

  const withMessages = conversation.addUserMessage(1, 'Crea una tarea').addAgentMessage('Voy a proponerla')
  assert(withMessages.messages.length === 2, 'Conversation should append messages')

  const proposedWrite = withMessages.proposeCommand({
    intent: 'CREATE_TASK',
    payload: { title: 'Nueva tarea', workspaceId: 'ws-1', projectId: 'prj-1' },
    idempotencyKey: 'cmd-write-001',
    proposedByUserId: 2,
  })
  const writeCommand = proposedWrite.commands[0]
  assert(writeCommand.requiresApproval, 'Write command should require approval')
  assert(writeCommand.proposedByUserId === 2, 'Command should track proposer user id')

  assertThrows(
    () => proposedWrite.markExecuted(writeCommand.id, 1),
    'INVALID_STATE',
  )

  const approved = proposedWrite.approveCommand(writeCommand.id, 1)
  const executed = approved.markExecuted(writeCommand.id, 1)
  assert(executed.commands[0].state === 'EXECUTED', 'Approved command should execute')

  const proposedRead = executed.proposeCommand({
    intent: 'READ_TASKS_DUE_TOMORROW',
    payload: { workspaceId: 'ws-1', projectId: 'prj-1' },
    idempotencyKey: 'cmd-read-001',
  })
  const readCommand = proposedRead.commands.find((entry) => entry.intent === 'READ_TASKS_DUE_TOMORROW')!
  assert(!readCommand.requiresApproval, 'Read command should not require approval')
  const readExecuted = proposedRead.markExecuted(readCommand.id, 1)
  assert(
    readExecuted.commands.find((entry) => entry.id === readCommand.id)?.state === 'EXECUTED',
    'Read command should execute without explicit approval',
  )

  assertThrows(
    () =>
      readExecuted.proposeCommand({
        intent: 'CREATE_TASK',
        payload: { title: 'Duplicada' },
        idempotencyKey: 'cmd-write-001',
      }),
    'DUPLICATE',
  )

  assertThrows(
    () =>
      readExecuted.proposeCommand({
        intent: 'CREATE_TASK',
        payload: { title: 'Fuera de contexto', workspaceId: 'ws-other' },
        idempotencyKey: 'cmd-write-002',
      }),
    'CONFLICT',
  )

  const closed = readExecuted.close(1)
  assert(closed.state === 'CLOSED', 'Conversation should close')
  assertThrows(() => closed.addUserMessage(1, 'hola?'), 'INVALID_STATE')
}
