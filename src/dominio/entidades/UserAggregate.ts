import { Email } from '../valores_objeto/Email'
import { PasswordHash } from '../valores_objeto/PasswordHash'
import { PersonName } from '../valores_objeto/PersonName'

type UserPrimitives = {
  id: number
  name: string
  email: string
  passwordHash: string
  salt: string
}

export class UserAggregate {
  private readonly _id: number
  private readonly _name: PersonName
  private readonly _email: Email
  private readonly _password: PasswordHash

  private constructor(data: {
    id: number
    name: PersonName
    email: Email
    password: PasswordHash
  }) {
    this._id = data.id
    this._name = data.name
    this._email = data.email
    this._password = data.password
  }

  static async register(data: {
    id: number
    name: string
    email: string
    password: string
  }) {
    const password = await PasswordHash.fromPassword(data.password)
    return new UserAggregate({
      id: data.id,
      name: PersonName.create(data.name),
      email: Email.create(data.email),
      password,
    })
  }

  static rehydrate(data: UserPrimitives) {
    return new UserAggregate({
      id: data.id,
      name: PersonName.create(data.name),
      email: Email.create(data.email),
      password: PasswordHash.restore(data.passwordHash, data.salt),
    })
  }

  async verifyPassword(rawPassword: string) {
    return this._password.verify(rawPassword)
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this._id,
      name: this._name.value,
      email: this._email.value,
      passwordHash: this._password.hash,
      salt: this._password.salt,
    }
  }

  get id() {
    return this._id
  }

  get name() {
    return this._name.value
  }

  get email() {
    return this._email.value
  }
}
