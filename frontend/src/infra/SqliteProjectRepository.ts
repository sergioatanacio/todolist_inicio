import type { Database } from 'sql.js'
import { ProjectAggregate } from '../dominio/entidades/ProjectAggregate'
import type { ProjectRepository } from '../dominio/puertos/ProjectRepository'

export class SqliteProjectRepository implements ProjectRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM projects WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let project: ProjectAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      const payload = JSON.parse(String(row.payload_json))
      project = ProjectAggregate.rehydrate(payload)
    }
    stmt.free()
    return project
  }

  findByWorkspaceId(workspaceId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM projects WHERE workspace_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([workspaceId])
    const result: ProjectAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      const payload = JSON.parse(String(row.payload_json))
      result.push(ProjectAggregate.rehydrate(payload))
    }
    stmt.free()
    return result
  }

  save(project: ProjectAggregate) {
    const data = project.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, workspace_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        workspace_id = excluded.workspace_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      project.id,
      project.workspaceId,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
