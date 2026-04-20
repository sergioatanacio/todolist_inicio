import type { AiAgentVm } from '../../../types/AppUiModels'
import { AI_INTENT_TYPES, type AiIntentType } from '../../../../dominio/valores_objeto/AiIntentType'

const INTENT_LABELS: Record<AiIntentType, string> = {
  READ_TASKS_DUE_TOMORROW: 'Leer tareas para mañana',
  CREATE_PROJECT: 'Crear proyecto',
  CREATE_TODO_LIST: 'Crear lista',
  CREATE_DISPONIBILIDAD: 'Crear disponibilidad',
  CREATE_TASK: 'Crear tarea',
  UPDATE_TASK_STATUS: 'Cambiar estado de tarea',
  ADD_TASK_COMMENT: 'Agregar comentario',
}

const parseSelectedIntents = (raw: string) => {
  const selected = new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  )
  return AI_INTENT_TYPES.filter((intent) => selected.has(intent))
}

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
  onDeleteAgent: (agentId: string) => void
  busy: boolean
}

const MODEL_OPTIONS = [
  { value: 'gpt-5-nano', label: 'gpt-5-nano (mas barato)' },
  { value: 'gpt-5-mini', label: 'gpt-5-mini (balance costo/calidad)' },
  { value: 'gpt-5', label: 'gpt-5 (alta capacidad)' },
] as const

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
  onDeleteAgent,
  busy,
}: AgentPanelProps) {
  const selectedIntents = parseSelectedIntents(allowedIntentsCsv)
  const allSelected = AI_INTENT_TYPES.every((intent) =>
    selectedIntents.includes(intent),
  )

  const setSelectedIntents = (intents: readonly AiIntentType[]) => {
    onAllowedIntentsCsvChange(intents.join(','))
  }

  const toggleIntent = (intent: AiIntentType) => {
    const exists = selectedIntents.includes(intent)
    const next = exists
      ? selectedIntents.filter((item) => item !== intent)
      : [...selectedIntents, intent]
    const ordered = AI_INTENT_TYPES.filter((item) => next.includes(item))
    setSelectedIntents(ordered)
  }

  const toggleAllIntents = (checked: boolean) => {
    setSelectedIntents(checked ? AI_INTENT_TYPES : [])
  }

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
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          {MODEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 rounded border border-slate-300 p-3">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAllIntents(e.target.checked)}
          />
          Acceso total (todos los intents)
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {AI_INTENT_TYPES.map((intent) => (
            <label key={intent} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIntents.includes(intent)}
                onChange={() => toggleIntent(intent)}
              />
              {INTENT_LABELS[intent]}
            </label>
          ))}
        </div>
      </div>
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
              <button
                type="button"
                onClick={() => onDeleteAgent(agent.id)}
                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
