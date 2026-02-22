import { aiAssistantUseCasesAppSpec } from './ai/AiAssistantUseCases.spec.ts'
import { workspaceUseCasesAppSpec } from './workspace/WorkspaceUseCases.spec.ts'
import { taskPlanningUseCasesAppSpec } from './task/TaskPlanningUseCases.spec.ts'

export const runApplicationSpecs = async () => {
  await workspaceUseCasesAppSpec()
  await taskPlanningUseCasesAppSpec()
  await aiAssistantUseCasesAppSpec()
  return 'ok'
}
