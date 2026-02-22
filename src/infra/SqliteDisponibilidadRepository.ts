import type { Database } from 'sql.js'
import { DisponibilidadAggregate } from '../dominio/entidades/DisponibilidadAggregate'
import type { DisponibilidadRepository } from '../dominio/puertos/DisponibilidadRepository'

export class SqliteDisponibilidadRepository implements DisponibilidadRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

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
    const stmt = this.db.prepare(`
      INSERT INTO disponibilidades (id, project_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      disponibilidad.id,
      disponibilidad.projectId,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
