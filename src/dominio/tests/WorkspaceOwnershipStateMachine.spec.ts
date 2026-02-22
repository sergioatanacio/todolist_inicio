import { transitionWorkspaceOwnership } from '../maquinas/workspace/WorkspaceOwnershipStateMachine.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

export const workspaceOwnershipStateMachineSpec = () => {
  assert(
    transitionWorkspaceOwnership('OWNED', 'TRANSFER') === 'OWNED',
    'Ownership machine must remain in OWNED after TRANSFER',
  )
}
