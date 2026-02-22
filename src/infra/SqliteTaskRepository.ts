import type { Database } from 'sql.js'
import { TaskAggregate } from '../dominio/entidades/TaskAggregate'
import type { TaskRepository } from '../dominio/puertos/TaskRepository'

export class SqliteTaskRepository implements TaskRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findById(id: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM tasks_domain WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let result: TaskAggregate | null = null
    if (stmt.step()) {
      const row = stmt.getAsObject()
      result = TaskAggregate.rehydrate(JSON.parse(String(row.payload_json)))
    }
    stmt.free()
    return result
  }

  findByTodoListId(todoListId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM tasks_domain WHERE todo_list_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([todoListId])
    const result: TaskAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(TaskAggregate.rehydrate(JSON.parse(String(row.payload_json))))
    }
    stmt.free()
    return result
  }

  findByProjectId(projectId: string) {
    const stmt = this.db.prepare(
      'SELECT payload_json FROM tasks_domain WHERE project_id = ? ORDER BY updated_at DESC',
    )
    stmt.bind([projectId])
    const result: TaskAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      result.push(TaskAggregate.rehydrate(JSON.parse(String(row.payload_json))))
    }
    stmt.free()
    return result
  }

  save(task: TaskAggregate) {
    const data = task.toPrimitives()
    const stmt = this.db.prepare(`
      INSERT INTO tasks_domain (id, project_id, todo_list_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        todo_list_id = excluded.todo_list_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    stmt.run([
      task.id,
      task.projectId,
      task.todoListId,
      JSON.stringify(data),
      Date.now(),
    ])
    stmt.free()
    void this.persist(this.db)
  }
}
