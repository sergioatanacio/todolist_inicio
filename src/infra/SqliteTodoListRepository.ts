import type { Database } from 'sql.js'
import { TodoListAggregate } from '../dominio/entidades/TodoListAggregate'
import type { TodoListRepository } from '../dominio/puertos/TodoListRepository'

export class SqliteTodoListRepository implements TodoListRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM todo_lists WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let result: TodoListAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = TodoListAggregate.rehydrate(JSON.parse(String(row.payload_json)))
    }
    stmt.free()
    return result
  }

  findByProjectId(projectId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM todo_lists WHERE project_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([projectId])
    const result: TodoListAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(TodoListAggregate.rehydrate(JSON.parse(String(row.payload_json))))
    }
    stmt.free()
    return result
  }

  save(todoList: TodoListAggregate) {
    const data = todoList.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO todo_lists (id, project_id, disponibilidad_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        disponibilidad_id = excluded.disponibilidad_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      todoList.id,
      todoList.projectId,
      todoList.disponibilidadId,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
