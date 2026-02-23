import type { AiConversationVm } from '../../../types/AppUiModels'

type ChatPanelProps = {
  conversation: AiConversationVm | null
  message: string
  onMessageChange: (value: string) => void
  onSend: () => void
  busy: boolean
}

export function ChatPanel({
  conversation,
  message,
  onMessageChange,
  onSend,
  busy,
}: ChatPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <h2 className="text-base font-semibold">Chat</h2>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded border border-slate-200 p-2">
        {conversation?.messages.map((item) => (
          <div key={item.id} className="rounded border border-slate-200 p-2 text-sm">
            <p className="text-xs font-semibold">{item.role}</p>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Escribe mensaje"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={busy || !conversation}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Enviar
        </button>
      </div>
    </section>
  )
}
