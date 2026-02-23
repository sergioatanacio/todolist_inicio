export type AiChatMessageInput = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AiToolCallResult = {
  intent: string
  payload: Record<string, unknown>
}

export type AiChatResult = {
  assistantMessage: string
  toolCalls: AiToolCallResult[]
}

export interface AiChatGateway {
  chat(data: {
    model: string
    token: string
    messages: AiChatMessageInput[]
    allowedIntents: string[]
  }): Promise<AiChatResult>
}
