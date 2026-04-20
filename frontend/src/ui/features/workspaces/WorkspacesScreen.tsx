import { useState } from 'react'
import type { WorkspaceVm } from '../../types/AppUiModels'

type WorkspacesScreenProps = {
  workspaceName: string
  onWorkspaceNameChange: (value: string) => void
  onCreate: () => void
  onUpdate: (workspaceId: string, name: string) => void
  busy: boolean
  error: string | null
  workspaces: WorkspaceVm[]
  onOpenWorkspace: (workspaceId: string) => void
}

export function WorkspacesScreen({
  workspaceName,
  onWorkspaceNameChange,
  onCreate,
  onUpdate,
  busy,
  error,
  workspaces,
  onOpenWorkspace,
}: WorkspacesScreenProps) {
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null)
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('')

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Workspaces</h1>
      <div className="mt-3 flex gap-2">
        <input
          value={workspaceName}
          onChange={(e) => onWorkspaceNameChange(e.target.value)}
          placeholder="Nombre workspace"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Crear
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 space-y-2">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="rounded border border-slate-300 px-3 py-2 text-sm">
            {editingWorkspaceId === workspace.id ? (
              <div className="space-y-2">
                <input
                  value={editingWorkspaceName}
                  onChange={(event) => setEditingWorkspaceName(event.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(workspace.id, editingWorkspaceName)
                      setEditingWorkspaceId(null)
                      setEditingWorkspaceName('')
                    }}
                    disabled={busy}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWorkspaceId(null)
                      setEditingWorkspaceName('')
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
                  onClick={() => onOpenWorkspace(workspace.id)}
                  className="text-left"
                >
                  {workspace.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWorkspaceId(workspace.id)
                    setEditingWorkspaceName(workspace.name)
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
