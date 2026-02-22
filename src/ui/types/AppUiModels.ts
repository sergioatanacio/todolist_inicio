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
  startDate: string
  endDate: string
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

export type UiErrors = {
  auth: string | null
  workspace: string | null
  project: string | null
  disponibilidad: string | null
  segment: string | null
  list: string | null
  task: string | null
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
  projectCalendar: Record<string, number>
  availabilityPlan: AvailabilityPlanVm | null
  context: AppControllerContextIds
}
