import type { AppServices } from '../../../aplicacion/AppBootstrap'
import type { AppControllerState } from '../../types/AppUiModels'

type LoaderDependencies = {
  setWorkspaces: (rows: AppControllerState['workspaces']) => void
  setProjects: (rows: AppControllerState['projects']) => void
  setDisponibilidades: (rows: AppControllerState['disponibilidades']) => void
  setLists: (rows: AppControllerState['lists']) => void
  setKanban: (rows: AppControllerState['kanban']) => void
  setSelectedDispId: (value: string | ((current: string) => string)) => void
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
    const disponibilidades = services.disponibilidad.listByProject(projectId).map((item) => ({
      id: item.id,
      projectId: item.projectId,
      name: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
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

  return {
    loadWorkspaces,
    loadWorkspaceContext,
    loadProjectContext,
    loadKanban,
  }
}
