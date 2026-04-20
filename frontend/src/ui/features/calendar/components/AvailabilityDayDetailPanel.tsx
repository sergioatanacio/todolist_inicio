import type { AvailabilityDayVm } from '../types/CalendarViewModels'

type AvailabilityDayDetailPanelProps = {
  selectedDay: AvailabilityDayVm | null
  onOpenKanban: (listId: string) => void
}

export function AvailabilityDayDetailPanel({
  selectedDay,
  onOpenKanban,
}: AvailabilityDayDetailPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-300 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-900">Detalle de bloques</h3>
      {!selectedDay ? (
        <p className="mt-2 text-sm text-slate-500">
          Selecciona un dia para ver bloques y accesos al kanban.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-semibold">{selectedDay.isoDate}</p>
          <p className="text-xs text-slate-600">
            Total: {selectedDay.totalMinutes} min · Bloques: {selectedDay.blocks.length}
          </p>
          <ul className="space-y-2">
            {selectedDay.blocks.map((block) => (
              <li
                key={`${block.taskId}-${block.scheduledStart}`}
                className="rounded border border-slate-300 bg-slate-50 p-2 text-xs"
              >
                <p>Task: {block.taskId}</p>
                <p>
                  {new Date(block.scheduledStart).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {new Date(block.scheduledEnd).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p>Duracion: {block.durationMinutes} min</p>
                <button
                  type="button"
                  onClick={() => onOpenKanban(block.todoListId)}
                  className="mt-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
                >
                  Ir a kanban ({block.todoListId})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
