import type { Database } from 'sql.js'
import type { NewUserRecord, UserRecord, UserRepository } from '../dominio/puertos/UserRepository'

export class SqliteUserRepository implements UserRepository {
  constructor(
    private readonly db: Database,
    private readonly persist: (db: Database) => Promise<void>,
  ) {}

  findByEmail(email: string) {
    const stmt = this.db.prepare(
      'SELECT id, name, email, password_hash, salt FROM users WHERE email = ? LIMIT 1',
    )
    stmt.bind([email])
    let row: UserRecord | null = null
    if (stmt.step()) {
      const result = stmt.getAsObject()
      row = {
        id: Number(result.id),
        name: String(result.name),
        email: String(result.email),
        passwordHash: String(result.password_hash),
        salt: String(result.salt),
      }
    }
    stmt.free()
    return row
  }

  findById(id: number) {
    const stmt = this.db.prepare(
      'SELECT id, name, email, password_hash, salt FROM users WHERE id = ? LIMIT 1',
    )
    stmt.bind([id])
    let row: UserRecord | null = null
    if (stmt.step()) {
      const result = stmt.getAsObject()
      row = {
        id: Number(result.id),
        name: String(result.name),
        email: String(result.email),
        passwordHash: String(result.password_hash),
        salt: String(result.salt),
      }
    }
    stmt.free()
    return row
  }

  save(user: NewUserRecord) {
    const stmt = this.db.prepare(
      'INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    stmt.run([
      user.name,
      user.email,
      user.passwordHash,
      user.salt,
      user.createdAt,
    ])
    stmt.free()
    const idRow = this.db.exec('SELECT last_insert_rowid() as id')
    const id = Number(idRow[0].values[0][0])
    void this.persist(this.db)
    return {
      id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      salt: user.salt,
    }
  }
}
