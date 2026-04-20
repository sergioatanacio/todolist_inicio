import type { Database } from 'sql.js'
import { WorkspaceAggregate } from '../dominio/entidades/WorkspaceAggregate'
import type { WorkspaceRepository } from '../dominio/puertos/WorkspaceRepository'

export class SqliteWorkspaceRepository implements WorkspaceRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM workspaces WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let workspace: WorkspaceAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      const payload = JSON.parse(String(row.payload_json))
      workspace = WorkspaceAggregate.rehydrate(payload)
    }
    stmt.free()
    return workspace
  }

  findByOwnerUserId(ownerUserId: number) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM workspaces WHERE owner_user_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([ownerUserId])
    const result: WorkspaceAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      const payload = JSON.parse(String(row.payload_json))
      result.push(WorkspaceAggregate.rehydrate(payload))
    }
    stmt.free()
    return result
  }

  save(workspace: WorkspaceAggregate) {
    const data = workspace.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO workspaces (id, owner_user_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        owner_user_id = excluded.owner_user_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      workspace.id,
      workspace.ownerUserId,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
