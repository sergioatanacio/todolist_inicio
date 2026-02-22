import type { WorkspaceVm } from '../../types/AppUiModels'

type WorkspacesScreenProps = {
  workspaceName: string
  onWorkspaceNameChange: (value: string) => void
  onCreate: () => void
  busy: boolean
  error: string | null
  workspaces: WorkspaceVm[]
  onOpenWorkspace: (workspaceId: string) => void
}

export function WorkspacesScreen({
  workspaceName,
  onWorkspaceNameChange,
  onCreate,
  busy,
  error,
  workspaces,
  onOpenWorkspace,
}: WorkspacesScreenProps) {
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
          <button
            key={workspace.id}
            type="button"
            onClick={() => onOpenWorkspace(workspace.id)}
            className="block w-full rounded border border-slate-300 px-3 py-2 text-left text-sm"
          >
            {workspace.name}
          </button>
        ))}
      </div>
    </section>
  )
}
