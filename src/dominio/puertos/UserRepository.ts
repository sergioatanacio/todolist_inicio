export type UserRecord = {
  id: number
  name: string
  email: string
  passwordHash: string
  salt: string
}

export type NewUserRecord = {
  name: string
  email: string
  passwordHash: string
  salt: string
  createdAt: number
}

export interface UserRepository {
  findByEmail(email: string): UserRecord | null
  findById(id: number): UserRecord | null
  save(user: NewUserRecord): UserRecord
}
