import type { Database } from 'sql.js'
import type { AiCredentialSecretStore } from '../../dominio/puertos/AiCredentialSecretStore'

export class SqliteAiSecretStore implements AiCredentialSecretStore {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  put(data: {
    workspaceId: string
    userId: number
    provider: string
    credentialRef: string
    secret: string
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO ai_secrets (
        workspace_id,
        user_id,
        provider,
        credential_ref,
        secret_value,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(workspace_id, user_id, provider) DO UPDATE SET
        credential_ref = excluded.credential_ref,
        secret_value = excluded.secret_value,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      data.workspaceId,
      data.userId,
      data.provider.trim().toUpperCase(),
      data.credentialRef,
      data.secret,
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }

  getByCredentialRef(credentialRef: string) {
    const stmt = this.db.prepare(
      'SELECT secret_value FROM ai_secrets WHERE credential_ref = ? LIMIT 1',
    )
    stmt.bind([credentialRef])
    let result: string | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = String(row.secret_value)
    }
    stmt.free()
    return result
  }

  deleteByCredentialRef(credentialRef: string) {
    const stmt = this.db.prepare('DELETE FROM ai_secrets WHERE credential_ref = ?')
    stmt.run([credentialRef])
    stmt.free()
    void this.persist(this.db)
  }
}
