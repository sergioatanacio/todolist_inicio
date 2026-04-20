import type { Database } from 'sql.js'
import { DisponibilidadAggregate } from '../dominio/entidades/DisponibilidadAggregate'
import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'

export class SqliteDisponibilidadRepository implements DisponibilidadRepository {
  private readonly hasWorkspaceIdColumn: boolean

  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {
    this.hasWorkspaceIdColumn = this.detectColumn('disponibilidades', 'workspace_id')
  }

  private detectColumn(tableName: string, columnName: string) {
    const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`)
    let found = false
    while (stmt.step()) {
      const row = stmt.getAsObject()
      if (String(row.name) === columnName) {
        found = true
        break
      }
    }
    stmt.free()
    return found
  }

  private resolveWorkspaceIdFromProject(projectId: string): string | null {
    const stmt = this.db.prepare(
      'SELECT workspace_id FROM projects WHERE id = ? LIMIT 1',
    )
    stmt.bind([projectId])
    let workspaceId: string | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      workspaceId = String(row.workspace_id)
    }
    stmt.free()
    return workspaceId
  }

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM disponibilidades WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let result: DisponibilidadAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      try {
        result = DisponibilidadAggregate.rehydrate(
          JSON.parse(String(row.payload_json)),
        )
      } catch {
        result = null
      }
    }
    stmt.free()
    return result
  }

  findByProjectId(projectId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM disponibilidades WHERE project_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([projectId])
    const result: DisponibilidadAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      try {
        result.push(
          DisponibilidadAggregate.rehydrate(JSON.parse(String(row.payload_json))),
        )
      } catch {
        // Ignorar snapshots incompatibles.
      }
    }
    stmt.free()
    return result
  }

  save(disponibilidad: DisponibilidadAggregate) {
    const data = disponibilidad.toPrimitives()
    const payload = JSON.stringify(data)
    const now = Date.now()
    const stmt = this.hasWorkspaceIdColumn
      ? this.db.prepare(`
          INSERT INTO disponibilidades (id, project_id, workspace_id, payload_json, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            workspace_id = excluded.workspace_id,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at
        `)
      : this.db.prepare(`
          INSERT INTO disponibilidades (id, project_id, payload_json, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            project_id = excluded.project_id,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at
        `)
    if (this.hasWorkspaceIdColumn) {
      // Compatibilidad con esquemas antiguos donde workspace_id es NOT NULL.
      const workspaceId =
        this.resolveWorkspaceIdFromProject(disponibilidad.projectId) ??
        disponibilidad.projectId
      stmt.run([
        disponibilidad.id,
        disponibilidad.projectId,
        workspaceId,
        payload,
        now,
      ])
    } else {
      stmt.run([disponibilidad.id, disponibilidad.projectId, payload, now])
    }
    stmt.free()
    void this.persist(this.db)
  }
}
