import type { TodoListVm } from '../../../types/AppUiModels'

type ProjectDayDetailPanelProps = {
  selectedDay: string | null
  taskCount: number
  lists: TodoListVm[]
  onOpenKanban: (listId: string) => void
}

export function ProjectDayDetailPanel({
  selectedDay,
  taskCount,
  lists,
  onOpenKanban,
}: ProjectDayDetailPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-300 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-900">Detalle del dia</h3>
      {!selectedDay ? (
        <p className="mt-2 text-sm text-slate-500">
          Selecciona un dia en el calendario para ver su resumen.
        </p>
      ) : (
        <div className="mt-2 space-y-2 text-sm">
          <p>
            <span className="font-semibold">{selectedDay}</span>
          </p>
          <p>Total tareas: {taskCount}</p>
          <p className="text-xs text-slate-600">
            La desagregacion por tarea se ve al abrir el kanban de una lista.
          </p>
        </div>
      )}

      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Ir a kanban de lista
        </p>
        <div className="space-y-2">
          {lists.length === 0 ? (
            <p className="text-xs text-slate-500">No hay listas en este proyecto.</p>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => onOpenKanban(list.id)}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-left text-xs"
              >
                {list.name}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
