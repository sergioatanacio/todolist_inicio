import { UserAggregate } from '../entidades/UserAggregate'
import { type UserRepository } from '../puertos/UserRepository'

type RegisterInput = {
  name: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

type AuthResult =
  | { ok: true; user: UserAggregate }
  | { ok: false; error: string }

export class AuthService {
  async register(input: RegisterInput, repo: UserRepository): Promise<AuthResult> {
    const existing = repo.findByEmail(input.email)
    if (existing) {
      return { ok: false, error: 'Ese correo ya esta registrado.' }
    }

    try {
      const temp = await UserAggregate.register({
        id: 0,
        name: input.name,
        email: input.email,
        password: input.password,
      })
      const primitives = temp.toPrimitives()
      const saved = repo.save({
        name: primitives.name,
        email: primitives.email,
        passwordHash: primitives.passwordHash,
        salt: primitives.salt,
        createdAt: Date.now(),
      })
      return { ok: true, user: UserAggregate.rehydrate(saved) }
    } catch (error) {
      return { ok: false, error: 'Datos invalidos.' }
    }
  }

  async login(input: LoginInput, repo: UserRepository): Promise<AuthResult> {
    const found = repo.findByEmail(input.email)
    if (!found) {
      return { ok: false, error: 'Usuario o contrasena incorrecta.' }
    }
    const user = UserAggregate.rehydrate(found)
    const ok = await user.verifyPassword(input.password)
    if (!ok) {
      return { ok: false, error: 'Usuario o contrasena incorrecta.' }
    }
    return { ok: true, user }
  }
}
