import type { Database } from 'sql.js'
import { TodoAggregate } from '../dominio/entidades/TodoAggregate'

export class SqliteTodoRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findByUserId(userId: number) {
    const stmt = this.db.prepare(
      'SELECT id, text, duration_minutes, done, created_at FROM todos WHERE user_id = ? ORDER BY created_at DESC',
    )
    stmt.bind([userId])
    const rows: TodoAggregate[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      rows.push(
        TodoAggregate.rehydrate({
          id: String(row.id),
          userId,
          text: String(row.text),
          durationMinutes: Number(row.duration_minutes),
          done: Number(row.done) === 1,
          createdAt: Number(row.created_at),
        }),
      )
    }
    stmt.free()
    return rows
  }

  async add(todo: TodoAggregate) {
    const data = todo.toPrimitives()
    const stmt = this.db.prepare(
      'INSERT INTO todos (id, user_id, text, duration_minutes, done, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    stmt.run([
      data.id,
      data.userId,
      data.text,
      data.durationMinutes,
      data.done ? 1 : 0,
      data.createdAt,
    ])
    stmt.free()
    await this.persist(this.db)
  }

  async update(todo: TodoAggregate) {
    const data = todo.toPrimitives()
    const stmt = this.db.prepare(
      'UPDATE todos SET done = ?, duration_minutes = ? WHERE id = ? AND user_id = ?',
    )
    stmt.run([data.done ? 1 : 0, data.durationMinutes, data.id, data.userId])
    stmt.free()
    await this.persist(this.db)
  }

  async remove(id: string, userId: number) {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    stmt.run([id, userId])
    stmt.free()
    await this.persist(this.db)
  }

  async clearCompleted(userId: number) {
    const stmt = this.db.prepare('DELETE FROM todos WHERE user_id = ? AND done = 1')
    stmt.run([userId])
    stmt.free()
    await this.persist(this.db)
  }
}
