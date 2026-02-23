import type { AiConversationVm } from '../../../types/AppUiModels'

type ConversationPanelProps = {
  conversations: AiConversationVm[]
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onStartConversation: () => void
  busy: boolean
}

export function ConversationPanel({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  busy,
}: ConversationPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Conversaciones</h2>
        <button
          type="button"
          onClick={onStartConversation}
          disabled={busy}
          className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Nueva
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={`block w-full rounded border px-3 py-2 text-left text-sm ${selectedConversationId === conversation.id ? 'border-slate-900' : 'border-slate-300'}`}
          >
            {conversation.state} | {conversation.id}
          </button>
        ))}
      </div>
    </section>
  )
}
