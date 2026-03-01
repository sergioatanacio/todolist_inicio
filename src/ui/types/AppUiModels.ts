import type { AppRoute } from '../router/AppRoute'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ABANDONED'

export type WorkspaceVm = { id: string; name: string }

export type ProjectVm = {
  id: string
  workspaceId: string
  name: string
  description: string
}

export type DisponibilidadVm = {
  id: string
  projectId: string
  name: string
  description: string
  startDate: string
  endDate: string
  remainingUsableMinutes: number
  segments: Array<{
    id: string
    name: string
    description: string
    startTime: string
    endTime: string
    specificDates: string[]
    exclusionDates: string[]
    daysOfWeek: number[]
    daysOfMonth: number[]
  }>
}

export type TodoListVm = {
  id: string
  projectId: string
  disponibilidadId: string
  name: string
  description: string
}

export type TaskVm = {
  id: string
  title: string
  status: TaskStatus
  durationMinutes: number
}

export type AvailabilityPlanVm = {
  plannedBlocks: Array<{
    taskId: string
    todoListId: string
    scheduledStart: number
    scheduledEnd: number
    durationMinutes: number
  }>
  unplannedTaskIds: string[]
}

export type ProjectCalendarVm = {
  plannedBlocks: Array<{
    taskId: string
    taskTitle: string
    todoListId: string
    todoListName: string
    disponibilidadId: string
    scheduledStart: number
    scheduledEnd: number
    durationMinutes: number
  }>
  tasksPerDay: Record<string, number>
  unplannedTaskIds: string[]
}

export type UiErrors = {
  auth: string | null
  workspace: string | null
  project: string | null
  disponibilidad: string | null
  segment: string | null
  list: string | null
  task: string | null
  aiWorkspace: string | null
  aiProject: string | null
}

export type AiAgentVm = {
  id: string
  workspaceId: string
  provider: string
  model: string
  state: 'ACTIVE' | 'PAUSED' | 'REVOKED'
  allowedIntents: string[]
  requireApprovalForWrites: boolean
}

export type AiUserCredentialVm = {
  id: string
  workspaceId: string
  userId: number
  provider: string
  credentialRef: string
  state: 'ACTIVE' | 'REVOKED'
} | null

export type AiConversationMessageVm = {
  id: string
  role: 'USER' | 'AGENT' | 'SYSTEM'
  authorUserId: number | null
  body: string
  createdAt: number
}

export type AiConversationCommandVm = {
  id: string
  intent: string
  payload: Record<string, unknown>
  requiresApproval: boolean
  state: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED'
  proposedByUserId: number
}

export type AiConversationVm = {
  id: string
  workspaceId: string
  projectId: string | null
  state: 'OPEN' | 'CLOSED'
  initiatorUserId: number
  agentId: string
  messages: AiConversationMessageVm[]
  commands: AiConversationCommandVm[]
}

export type AppControllerContextIds = {
  workspaceId: string | null
  projectId: string | null
  disponibilidadId: string | null
  listId: string | null
}

export type AppControllerState = {
  ready: boolean
  route: AppRoute
  authMode: 'login' | 'register'
  userId: number | null
  userName: string
  userEmail: string
  busy: boolean
  errors: UiErrors
  workspaces: WorkspaceVm[]
  projects: ProjectVm[]
  disponibilidades: DisponibilidadVm[]
  lists: TodoListVm[]
  kanban: Record<TaskStatus, TaskVm[]>
  projectCalendar: ProjectCalendarVm
  availabilityPlan: AvailabilityPlanVm | null
  aiAgents: AiAgentVm[]
  aiConversations: AiConversationVm[]
  aiSelectedConversationId: string | null
  aiUserCredential: AiUserCredentialVm
  context: AppControllerContextIds
}
