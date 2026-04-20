import type { Database } from 'sql.js'
import { domainError } from '../dominio/errores/DomainError'
import { AiUserCredentialAggregate } from '../dominio/entidades/AiUserCredentialAggregate'
import type { AiUserCredentialRepository } from '../dominio/puertos/AiUserCredentialRepository'

const parsePayload = (raw: unknown) => {
  try {
    return JSON.parse(String(raw))
  } catch {
    throw domainError('VALIDATION_ERROR', 'JSON invalido en ai_user_credentials')
  }
}

export class SqliteAiUserCredentialRepository
  implements AiUserCredentialRepository
{
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findByWorkspaceAndUser(workspaceId: string, userId: number) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM ai_user_credentials WHERE workspace_id = ? AND user_id = ? LIMIT 1',
    )
    stmt.bind([workspaceId, userId])
    let result: AiUserCredentialAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = AiUserCredentialAggregate.rehydrate(parsePayload(row.payload_json))
    }
    stmt.free()
    return result
  }

  save(credential: AiUserCredentialAggregate) {
    const data = credential.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO ai_user_credentials (id, workspace_id, user_id, state, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(workspace_id, user_id) DO UPDATE SET
        id = excluded.id,
        state = excluded.state,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      credential.id,
      credential.workspaceId,
      credential.userId,
      credential.state,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
