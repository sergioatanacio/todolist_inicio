import type { AvailabilityPlanVm } from '../../types/AppUiModels'

export function AvailabilityCalendarScreen({ plan }: { plan: AvailabilityPlanVm | null }) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h1 className="text-lg font-semibold">Calendar disponibilidad</h1>
      {!plan ? (
        <p className="text-sm text-slate-500">Sin datos.</p>
      ) : (
        <div className="space-y-2 text-sm">
          <p>Bloques: {plan.plannedBlocks.length}</p>
          <p>No planificadas: {plan.unplannedTaskIds.length}</p>
          {plan.plannedBlocks.map((block) => (
            <div key={`${block.taskId}-${block.scheduledStart}`} className="rounded border border-slate-300 px-2 py-1 text-xs">
              {block.taskId} | {new Date(block.scheduledStart).toLocaleString()} - {new Date(block.scheduledEnd).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
