import { AuthService } from '../dominio/servicios/AuthService'
import type { UserRepository } from '../dominio/puertos/UserRepository'

type RegisterInput = {
  name: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

export class AuthAppService {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  register(input: RegisterInput) {
    return this.authService.register(input, this.userRepo)
  }

  login(input: LoginInput) {
    return this.authService.login(input, this.userRepo)
  }

  restoreSession(userId: number) {
    const record = this.userRepo.findById(userId)
    if (!record) return null
    return record
  }
}
