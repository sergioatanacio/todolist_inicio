import { workspaceUseCasesAppSpec } from './workspace/WorkspaceUseCases.spec.ts'
import { taskPlanningUseCasesAppSpec } from './task/TaskPlanningUseCases.spec.ts'

export const runApplicationSpecs = async () => {
  await workspaceUseCasesAppSpec()
  await taskPlanningUseCasesAppSpec()
  return 'ok'
}
