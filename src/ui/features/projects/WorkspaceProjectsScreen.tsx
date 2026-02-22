import type { ProjectVm } from '../../types/AppUiModels'

type WorkspaceProjectsScreenProps = {
  projectName: string
  projectDescription: string
  onProjectNameChange: (value: string) => void
  onProjectDescriptionChange: (value: string) => void
  onCreateProject: () => void
  busy: boolean
  error: string | null
  projects: ProjectVm[]
  onOpenProject: (workspaceId: string, projectId: string) => void
}

export function WorkspaceProjectsScreen({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  onCreateProject,
  busy,
  error,
  projects,
  onOpenProject,
}: WorkspaceProjectsScreenProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Proyectos</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Nombre proyecto"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={projectDescription}
          onChange={(e) => onProjectDescriptionChange(e.target.value)}
          placeholder="Descripcion"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onCreateProject}
        disabled={busy}
        className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Crear proyecto
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-3 space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onOpenProject(project.workspaceId, project.id)}
            className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm"
          >
            {project.name}
          </button>
        ))}
      </div>
    </section>
  )
}
