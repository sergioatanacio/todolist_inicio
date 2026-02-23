import type { Database } from 'sql.js'
import type { IdempotencyRepository } from '../dominio/puertos/IdempotencyRepository'

export class SqliteIdempotencyRepository implements IdempotencyRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  exists(key: string) {
    const stmt = this.db.prepare(
      'SELECT key FROM idempotency_keys WHERE key = ? LIMIT 1',
    )
    stmt.bind([key])
    const found = stmt.step()
    stmt.free()
    return found
  }

  save(key: string, metadata?: Record<string, unknown>) {
    const stmt = this.db.prepare(`
      INSERT INTO idempotency_keys (key, metadata_json, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO NOTHING
    `)
    stmt.run([key, JSON.stringify(metadata ?? {}), Date.now()])
    stmt.free()
    void this.persist(this.db)
  }
}
