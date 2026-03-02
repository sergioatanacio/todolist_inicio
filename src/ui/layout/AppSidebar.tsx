import type { AppRoute } from '../router/AppRoute'

type SidebarProps = {
  route: AppRoute
  workspaceId: string | null
  projectId: string | null
  onGoWorkspaces: () => void
  onGoWorkspaceProjects: (workspaceId: string) => void
  onGoWorkspaceAi: (workspaceId: string) => void
  onGoProjectOverview: (workspaceId: string, projectId: string) => void
  onGoProjectDisponibilidades: (workspaceId: string, projectId: string) => void
  onGoProjectLists: (workspaceId: string, projectId: string) => void
  onGoProjectCalendar: (workspaceId: string, projectId: string) => void
  onGoProjectAi: (workspaceId: string, projectId: string) => void
}

export function AppSidebar({
  route,
  workspaceId,
  projectId,
  onGoWorkspaces,
  onGoWorkspaceProjects,
  onGoWorkspaceAi,
  onGoProjectOverview,
  onGoProjectDisponibilidades,
  onGoProjectLists,
  onGoProjectCalendar,
  onGoProjectAi,
}: SidebarProps) {
  const itemClass = (active: boolean) =>
    `mb-2 w-full rounded border px-2 py-2 text-left text-sm transition-colors ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
    }`

  const workspacesActive = route.kind === 'workspaces'
  const workspaceProjectsActive = route.kind === 'workspace'
  const workspaceAiActive = route.kind === 'workspaceAi'
  const overviewActive = route.kind === 'project' && route.tab === 'overview'
  const disponibilidadesActive =
    (route.kind === 'project' && route.tab === 'disponibilidades') ||
    route.kind === 'availability' ||
    route.kind === 'availabilityCalendar'
  const listsActive =
    (route.kind === 'project' && route.tab === 'lists') || route.kind === 'kanban'
  const projectCalendarActive =
    route.kind === 'project' && route.tab === 'calendar'
  const projectAiActive = route.kind === 'project' && route.tab === 'ai'

  return (
    <>
      <button
        type="button"
        onClick={onGoWorkspaces}
        className={itemClass(workspacesActive)}
      >
        Workspaces
      </button>
      {workspaceId ? (
        <>
          <button
            type="button"
            onClick={() => onGoWorkspaceProjects(workspaceId)}
            className={itemClass(workspaceProjectsActive)}
          >
            Proyectos
          </button>
          <button
            type="button"
            onClick={() => onGoWorkspaceAi(workspaceId)}
            className={itemClass(workspaceAiActive)}
          >
            IA workspace
          </button>
        </>
      ) : null}
      {workspaceId && projectId ? (
        <>
          <button
            type="button"
            onClick={() => onGoProjectOverview(workspaceId, projectId)}
            className={itemClass(overviewActive)}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onGoProjectDisponibilidades(workspaceId, projectId)}
            className={itemClass(disponibilidadesActive)}
          >
            Disponibilidades
          </button>
          <button
            type="button"
            onClick={() => onGoProjectLists(workspaceId, projectId)}
            className={itemClass(listsActive)}
          >
            Listas
          </button>
          <button
            type="button"
            onClick={() => onGoProjectCalendar(workspaceId, projectId)}
            className={itemClass(projectCalendarActive)}
          >
            Calendar proyecto
          </button>
          <button
            type="button"
            onClick={() => onGoProjectAi(workspaceId, projectId)}
            className={itemClass(projectAiActive)}
          >
            IA proyecto
          </button>
        </>
      ) : null}
    </>
  )
}
