import type { ProjectCalendarVm } from '../../../types/AppUiModels'

type ProjectDayDetailPanelProps = {
  selectedDay: string | null
  blockCount: number
  selectedDayBlocks: ProjectCalendarVm['plannedBlocks']
  onOpenKanban: (listId: string) => void
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

export function ProjectDayDetailPanel({
  selectedDay,
  blockCount,
  selectedDayBlocks,
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
          <p>Total bloques: {blockCount}</p>
          <div className="space-y-2">
            {selectedDayBlocks.length === 0 ? (
              <p className="text-xs text-slate-500">No hay bloques para este dia.</p>
            ) : (
              selectedDayBlocks.map((block) => (
                <article
                  key={`${block.taskId}-${block.scheduledStart}`}
                  className="rounded border border-slate-300 bg-slate-50 p-2"
                >
                  <p className="text-xs font-semibold">{block.taskTitle}</p>
                  <p className="text-[11px] text-slate-700">
                    {formatTime(block.scheduledStart)} - {formatTime(block.scheduledEnd)} ·{' '}
                    {block.durationMinutes} min
                  </p>
                  <p className="text-[11px] text-slate-700">Lista: {block.todoListName}</p>
                  <button
                    type="button"
                    onClick={() => onOpenKanban(block.todoListId)}
                    className="mt-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
                  >
                    Ir a kanban
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
