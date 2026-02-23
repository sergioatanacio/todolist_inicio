import type { AiConversationVm } from '../../../types/AppUiModels'

type CommandQueuePanelProps = {
  conversation: AiConversationVm | null
  onApprove: (commandId: string) => void
  onReject: (commandId: string) => void
  onExecute: (commandId: string) => void
  busy: boolean
}

const canApproveReject = (state: string) => state === 'PROPOSED'
const canExecute = (state: string, requiresApproval: boolean) =>
  state === 'APPROVED' || (state === 'PROPOSED' && !requiresApproval)

export function CommandQueuePanel({
  conversation,
  onApprove,
  onReject,
  onExecute,
  busy,
}: CommandQueuePanelProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h2 className="text-base font-semibold">Comandos propuestos</h2>
      <div className="mt-3 space-y-2">
        {conversation?.commands.map((command) => (
          <div key={command.id} className="rounded border border-slate-300 p-3 text-sm">
            <p className="font-semibold">{command.intent}</p>
            <p className="text-xs text-slate-600">
              Estado: {command.state} | Requires approval: {String(command.requiresApproval)}
            </p>
            <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs">
              {JSON.stringify(command.payload, null, 2)}
            </pre>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onApprove(command.id)}
                disabled={busy || !canApproveReject(command.state)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => onReject(command.id)}
                disabled={busy || !canApproveReject(command.state)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => onExecute(command.id)}
                disabled={busy || !canExecute(command.state, command.requiresApproval)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Ejecutar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
