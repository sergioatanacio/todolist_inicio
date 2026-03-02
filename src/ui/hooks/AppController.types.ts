import type { UiForms, UiFormSetters } from './state/useUiForms'
import type { AppControllerState, TaskStatus } from '../types/AppUiModels'

export type AppController = {
  state: AppControllerState
  forms: UiForms
  setForms: UiFormSetters
  actions: {
    navigate: (path: string, replace?: boolean) => void
    submitAuth: () => Promise<void>
    logout: () => void
    createWorkspace: () => Promise<void>
    updateWorkspace: (workspaceId: string, name: string) => Promise<void>
    createProject: () => Promise<void>
    updateProject: (
      projectId: string,
      name: string,
      description: string,
    ) => Promise<void>
    createDisponibilidad: () => Promise<void>
    updateSegment: (
      segmentId: string,
      data: {
        name: string
        description: string
        startTime: string
        endTime: string
        specificDates: string
        exclusionDates: string
        daysOfWeek: string
        daysOfMonth: string
      },
    ) => Promise<void>
    deleteSegment: (segmentId: string) => Promise<void>
    updateDisponibilidad: (
      disponibilidadId: string,
      data: {
        name: string
        description: string
        startDate: string
        endDate: string
      },
    ) => Promise<void>
    addSegment: () => Promise<void>
    createList: () => Promise<void>
    updateList: (todoListId: string, data: { name: string; description: string }) => Promise<void>
    createTask: () => Promise<void>
    updateTask: (
      taskId: string,
      data: { title: string; description: string; durationMinutes: number },
    ) => Promise<void>
    changeStatus: (taskId: string, toStatus: TaskStatus) => Promise<void>
    moveTaskInStatus: (taskId: string, direction: 'up' | 'down') => Promise<void>
    createAiAgent: () => Promise<void>
    setAiAgentState: (
      agentId: string,
      action: 'pause' | 'activate' | 'revoke',
    ) => Promise<void>
    deleteAiAgent: (agentId: string) => Promise<void>
    registerAiCredential: () => Promise<void>
    rotateAiCredential: () => Promise<void>
    revokeAiCredential: () => Promise<void>
    saveAiCredentialSecret: () => Promise<void>
    startAiConversation: () => Promise<void>
    selectAiConversation: (conversationId: string) => void
    sendAiChatMessage: () => Promise<void>
    approveAiCommand: (commandId: string) => Promise<void>
    rejectAiCommand: (commandId: string) => Promise<void>
    executeAiCommand: (commandId: string) => Promise<void>
    setAuthMode: (mode: 'login' | 'register') => void
  }
}
