import type { AiConversationVm } from '../../types/AppUiModels'
import { ChatPanel } from './components/ChatPanel'
import { CommandQueuePanel } from './components/CommandQueuePanel'
import { ConversationPanel } from './components/ConversationPanel'

type ProjectAiScreenProps = {
  conversations: AiConversationVm[]
  selectedConversationId: string | null
  message: string
  onMessageChange: (value: string) => void
  onSelectConversation: (conversationId: string) => void
  onStartConversation: () => void
  onSendMessage: () => void
  onApproveCommand: (commandId: string) => void
  onRejectCommand: (commandId: string) => void
  onExecuteCommand: (commandId: string) => void
  busy: boolean
  error: string | null
}

export function ProjectAiScreen({
  conversations,
  selectedConversationId,
  message,
  onMessageChange,
  onSelectConversation,
  onStartConversation,
  onSendMessage,
  onApproveCommand,
  onRejectCommand,
  onExecuteCommand,
  busy,
  error,
}: ProjectAiScreenProps) {
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <ConversationPanel
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={onSelectConversation}
        onStartConversation={onStartConversation}
        busy={busy}
      />
      <div className="space-y-4">
        <ChatPanel
          conversation={selectedConversation}
          message={message}
          onMessageChange={onMessageChange}
          onSend={onSendMessage}
          busy={busy}
        />
        <CommandQueuePanel
          conversation={selectedConversation}
          onApprove={onApproveCommand}
          onReject={onRejectCommand}
          onExecute={onExecuteCommand}
          busy={busy}
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  )
}
