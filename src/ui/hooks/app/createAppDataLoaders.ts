import type { AppServices } from '../../../aplicacion/AppBootstrap'
import type { AppControllerState } from '../../types/AppUiModels'

type LoaderDependencies = {
  setWorkspaces: (rows: AppControllerState['workspaces']) => void
  setProjects: (rows: AppControllerState['projects']) => void
  setDisponibilidades: (rows: AppControllerState['disponibilidades']) => void
  setLists: (rows: AppControllerState['lists']) => void
  setKanban: (rows: AppControllerState['kanban']) => void
  setSelectedDispId: (value: string | ((current: string) => string)) => void
  setAiAgents: (rows: AppControllerState['aiAgents']) => void
  setAiConversations: (rows: AppControllerState['aiConversations']) => void
  setAiSelectedConversationId: (
    value: string | null | ((current: string | null) => string | null),
  ) => void
  setAiUserCredential: (row: AppControllerState['aiUserCredential']) => void
}

export const createAppDataLoaders = (deps: LoaderDependencies) => {
  const loadWorkspaces = (services: AppServices, actorUserId: number) => {
    const rows = services.workspace
      .listByOwnerUserId(actorUserId)
      .map((workspace) => ({ id: workspace.id, name: workspace.name }))
    deps.setWorkspaces(rows)
    return rows
  }

  const loadWorkspaceContext = (
    services: AppServices,
    workspaceId: string,
    actorUserId: number,
  ) => {
    const rows = services.project.listByWorkspace(workspaceId, actorUserId).map((project) => ({
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      description: project.description,
    }))
    deps.setProjects(rows)
  }

  const loadProjectContext = (services: AppServices, projectId: string) => {
    const nowMs = Date.now()
    const disponibilidades = services.disponibilidad.listByProject(projectId).map((item) => ({
      id: item.id,
      projectId: item.projectId,
      name: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
      remainingUsableMinutes: item.calcularMinutosValidosDesde(nowMs),
      segments: item.segments.map((segment) => ({
        id: segment.id,
        name: segment.name,
        description: segment.description,
        startTime: segment.startTime,
        endTime: segment.endTime,
        specificDates: segment.specificDates,
        exclusionDates: segment.exclusionDates,
        daysOfWeek: segment.daysOfWeek,
        daysOfMonth: segment.daysOfMonth,
      })),
    }))
    deps.setDisponibilidades(disponibilidades)
    deps.setSelectedDispId(
      (current) => current || disponibilidades[0]?.id || '',
    )

    const lists = services.todoList.listByProject(projectId).map((list) => ({
      id: list.id,
      projectId: list.projectId,
      disponibilidadId: list.disponibilidadId,
      name: list.name,
    }))
    deps.setLists(lists)
  }

  const loadKanban = (services: AppServices, todoListId: string) => {
    const data = services.taskPlanning.getKanbanByTodoList(todoListId)
    deps.setKanban({
      PENDING: data.PENDING.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        durationMinutes: task.durationMinutes,
      })),
      IN_PROGRESS: data.IN_PROGRESS.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        durationMinutes: task.durationMinutes,
      })),
      DONE: data.DONE.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        durationMinutes: task.durationMinutes,
      })),
      ABANDONED: data.ABANDONED.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        durationMinutes: task.durationMinutes,
      })),
    })
  }

  const loadAiWorkspaceContext = (
    services: AppServices,
    workspaceId: string,
    userId: number,
  ) => {
    const agents = services.aiAssistant
      .listAgentsByWorkspace(workspaceId)
      .map((agent) => ({
        id: agent.id,
        workspaceId: agent.workspaceId,
        provider: agent.provider,
        model: agent.model,
        state: agent.state,
        allowedIntents: agent.policy.allowedIntents,
        requireApprovalForWrites: agent.policy.requireApprovalForWrites,
      }))
    deps.setAiAgents(agents)
    deps.setAiUserCredential(
      (() => {
        const credential = services.aiAssistant.findUserCredential(workspaceId, userId)
        if (!credential) return null
        return {
          id: credential.id,
          workspaceId: credential.workspaceId,
          userId: credential.userId,
          provider: credential.provider,
          credentialRef: credential.credentialRef,
          state: credential.state,
        }
      })(),
    )
  }

  const loadAiProjectContext = (
    services: AppServices,
    workspaceId: string,
    projectId: string,
    userId: number,
  ) => {
    loadAiWorkspaceContext(services, workspaceId, userId)
    const conversations = services.aiAssistant
      .listConversationsByWorkspace(workspaceId)
      .filter((conversation) => conversation.projectId === projectId)
      .map((conversation) => ({
        id: conversation.id,
        workspaceId: conversation.workspaceId,
        projectId: conversation.projectId,
        state: conversation.state,
        initiatorUserId: conversation.initiatorUserId,
        agentId: conversation.agentId,
        messages: conversation.messages.map((message) => ({
          id: message.id,
          role: message.role,
          authorUserId: message.authorUserId,
          body: message.body,
          createdAt: message.createdAt,
        })),
        commands: conversation.commands.map((command) => ({
          id: command.id,
          intent: command.intent,
          payload: command.payload,
          requiresApproval: command.requiresApproval,
          state: command.state,
          proposedByUserId: command.proposedByUserId ?? conversation.initiatorUserId,
        })),
      }))
    deps.setAiConversations(conversations)
    deps.setAiSelectedConversationId((current) => {
      if (current && conversations.some((item) => item.id === current)) return current
      return conversations[0]?.id ?? null
    })
  }

  return {
    loadWorkspaces,
    loadWorkspaceContext,
    loadProjectContext,
    loadKanban,
    loadAiWorkspaceContext,
    loadAiProjectContext,
  }
}
