import { workspaceUseCasesAppSpec } from './workspace/WorkspaceUseCases.spec.ts'

export const runApplicationSpecs = async () => {
  await workspaceUseCasesAppSpec()
  return 'ok'
}
