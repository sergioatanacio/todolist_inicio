type SidebarProps = {
  workspaceId: string | null
  projectId: string | null
  onGoWorkspaces: () => void
  onGoWorkspaceProjects: (workspaceId: string) => void
  onGoProjectOverview: (workspaceId: string, projectId: string) => void
  onGoProjectDisponibilidades: (workspaceId: string, projectId: string) => void
  onGoProjectLists: (workspaceId: string, projectId: string) => void
  onGoProjectCalendar: (workspaceId: string, projectId: string) => void
}

export function AppSidebar({
  workspaceId,
  projectId,
  onGoWorkspaces,
  onGoWorkspaceProjects,
  onGoProjectOverview,
  onGoProjectDisponibilidades,
  onGoProjectLists,
  onGoProjectCalendar,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onGoWorkspaces}
        className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
      >
        Workspaces
      </button>
      {workspaceId ? (
        <button
          type="button"
          onClick={() => onGoWorkspaceProjects(workspaceId)}
          className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
        >
          Proyectos
        </button>
      ) : null}
      {workspaceId && projectId ? (
        <>
          <button
            type="button"
            onClick={() => onGoProjectOverview(workspaceId, projectId)}
            className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onGoProjectDisponibilidades(workspaceId, projectId)}
            className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
          >
            Disponibilidades
          </button>
          <button
            type="button"
            onClick={() => onGoProjectLists(workspaceId, projectId)}
            className="mb-2 w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
          >
            Listas
          </button>
          <button
            type="button"
            onClick={() => onGoProjectCalendar(workspaceId, projectId)}
            className="w-full rounded border border-slate-300 px-2 py-2 text-left text-sm"
          >
            Calendar proyecto
          </button>
        </>
      ) : null}
    </>
  )
}
