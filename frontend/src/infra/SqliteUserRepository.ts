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
    const idResult = this.db.exec('SELECT last_insert_rowid() as id') as Array<{
      values: unknown[][]
    }>
    const rawId = idResult[0]?.values[0]?.[0]
    if (typeof rawId !== 'number' && typeof rawId !== 'string' && typeof rawId !== 'bigint') {
      throw new Error('Could not obtain inserted user id')
    }
    const id = Number(rawId)
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
