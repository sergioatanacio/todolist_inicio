import { useState } from 'react'
import type { ProjectVm } from '../../types/AppUiModels'

type WorkspaceProjectsScreenProps = {
  projectName: string
  projectDescription: string
  onProjectNameChange: (value: string) => void
  onProjectDescriptionChange: (value: string) => void
  onCreateProject: () => void
  onUpdateProject: (projectId: string, name: string, description: string) => void
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
  onUpdateProject,
  busy,
  error,
  projects,
  onOpenProject,
}: WorkspaceProjectsScreenProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingProjectName, setEditingProjectName] = useState('')
  const [editingProjectDescription, setEditingProjectDescription] = useState('')

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
          <div key={project.id} className="rounded border border-slate-300 px-3 py-2 text-sm">
            {editingProjectId === project.id ? (
              <div className="space-y-2">
                <input
                  value={editingProjectName}
                  onChange={(event) => setEditingProjectName(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  value={editingProjectDescription}
                  onChange={(event) => setEditingProjectDescription(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProject(
                        project.id,
                        editingProjectName,
                        editingProjectDescription,
                      )
                      setEditingProjectId(null)
                      setEditingProjectName('')
                      setEditingProjectDescription('')
                    }}
                    disabled={busy}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProjectId(null)
                      setEditingProjectName('')
                      setEditingProjectDescription('')
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenProject(project.workspaceId, project.id)}
                  className="text-left"
                >
                  {project.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProjectId(project.id)
                    setEditingProjectName(project.name)
                    setEditingProjectDescription(project.description)
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
