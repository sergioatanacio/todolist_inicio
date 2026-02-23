import type { Database } from 'sql.js'
import { domainError } from '../dominio/errores/DomainError'
import { AiAgentAggregate } from '../dominio/entidades/AiAgentAggregate'
import type { AiAgentRepository } from '../dominio/puertos/AiAgentRepository'

const parsePayload = (raw: unknown, entity: string) => {
  try {
    return JSON.parse(String(raw))
  } catch {
    throw domainError('VALIDATION_ERROR', `JSON invalido en ${entity}`)
  }
}

export class SqliteAiAgentRepository implements AiAgentRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM ai_agents WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let result: AiAgentAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = AiAgentAggregate.rehydrate(parsePayload(row.payload_json, 'ai_agents'))
    }
    stmt.free()
    return result
  }

  findByWorkspaceId(workspaceId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM ai_agents WHERE workspace_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([workspaceId])
    const result: AiAgentAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(
        AiAgentAggregate.rehydrate(parsePayload(row.payload_json, 'ai_agents')),
      )
    }
    stmt.free()
    return result
  }

  save(agent: AiAgentAggregate) {
    const data = agent.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO ai_agents (id, workspace_id, created_by_user_id, state, policy_json, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        workspace_id = excluded.workspace_id,
        created_by_user_id = excluded.created_by_user_id,
        state = excluded.state,
        policy_json = excluded.policy_json,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      agent.id,
      agent.workspaceId,
      agent.createdByUserId,
      agent.state,
      JSON.stringify(data.policy ?? {}),
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
