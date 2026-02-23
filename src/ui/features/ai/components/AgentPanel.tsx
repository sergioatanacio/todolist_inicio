import type { AiAgentVm } from '../../../types/AppUiModels'

type AgentPanelProps = {
  agents: AiAgentVm[]
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
  provider: string
  model: string
  allowedIntentsCsv: string
  requireApprovalForWrites: boolean
  onProviderChange: (value: string) => void
  onModelChange: (value: string) => void
  onAllowedIntentsCsvChange: (value: string) => void
  onRequireApprovalChange: (value: boolean) => void
  onCreateAgent: () => void
  onPauseAgent: (agentId: string) => void
  onActivateAgent: (agentId: string) => void
  onRevokeAgent: (agentId: string) => void
  busy: boolean
}

export function AgentPanel({
  agents,
  selectedAgentId,
  onSelectAgent,
  provider,
  model,
  allowedIntentsCsv,
  requireApprovalForWrites,
  onProviderChange,
  onModelChange,
  onAllowedIntentsCsvChange,
  onRequireApprovalChange,
  onCreateAgent,
  onPauseAgent,
  onActivateAgent,
  onRevokeAgent,
  busy,
}: AgentPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h2 className="text-base font-semibold">Agente IA</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          placeholder="provider"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="model"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        value={allowedIntentsCsv}
        onChange={(e) => onAllowedIntentsCsvChange(e.target.value)}
        placeholder="intents CSV"
        className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requireApprovalForWrites}
          onChange={(e) => onRequireApprovalChange(e.target.checked)}
        />
        Requiere aprobacion para writes
      </label>
      <button
        type="button"
        onClick={onCreateAgent}
        disabled={busy}
        className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Crear agente
      </button>

      <div className="mt-4 space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded border border-slate-300 p-3 text-sm">
            <button
              type="button"
              onClick={() => onSelectAgent(agent.id)}
              className={`w-full text-left font-semibold ${selectedAgentId === agent.id ? 'text-slate-900' : 'text-slate-600'}`}
            >
              {agent.provider} / {agent.model} ({agent.state})
            </button>
            <p className="mt-1 text-xs text-slate-600">{agent.id}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onPauseAgent(agent.id)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Pausar
              </button>
              <button
                type="button"
                onClick={() => onActivateAgent(agent.id)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Activar
              </button>
              <button
                type="button"
                onClick={() => onRevokeAgent(agent.id)}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Revocar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
