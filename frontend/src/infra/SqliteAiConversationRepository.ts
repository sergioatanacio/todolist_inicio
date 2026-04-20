import type { Database } from 'sql.js'
import { domainError } from '../dominio/errores/DomainError'
import { AiConversationAggregate } from '../dominio/entidades/AiConversationAggregate'
import type { AiConversationRepository } from '../dominio/puertos/AiConversationRepository'

const parsePayload = (raw: unknown, entity: string) => {
  try {
    return JSON.parse(String(raw))
  } catch {
    throw domainError('VALIDATION_ERROR', `JSON invalido en ${entity}`)
  }
}

export class SqliteAiConversationRepository implements AiConversationRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM ai_conversations WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let result: AiConversationAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = AiConversationAggregate.rehydrate(
        parsePayload(row.payload_json, 'ai_conversations'),
      )
    }
    stmt.free()
    return result
  }

  findByWorkspaceId(workspaceId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM ai_conversations WHERE workspace_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([workspaceId])
    const result: AiConversationAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(
        AiConversationAggregate.rehydrate(
          parsePayload(row.payload_json, 'ai_conversations'),
        ),
      )
    }
    stmt.free()
    return result
  }

  save(conversation: AiConversationAggregate) {
    const data = conversation.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO ai_conversations (id, workspace_id, agent_id, state, messages_json, commands_json, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        workspace_id = excluded.workspace_id,
        agent_id = excluded.agent_id,
        state = excluded.state,
        messages_json = excluded.messages_json,
        commands_json = excluded.commands_json,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      conversation.id,
      conversation.workspaceId,
      conversation.agentId,
      conversation.state,
      JSON.stringify(data.messages ?? []),
      JSON.stringify(data.commands ?? []),
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
