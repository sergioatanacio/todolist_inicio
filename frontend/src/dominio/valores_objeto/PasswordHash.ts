const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const generateSalt = () => {
  const buffer = new Uint8Array(16)
  crypto.getRandomValues(buffer)
  return toHex(buffer.buffer)
}

export class PasswordHash {
  private readonly _hash: string
  private readonly _salt: string

  private constructor(hash: string, salt: string) {
    this._hash = hash
    this._salt = salt
  }

  static async fromPassword(password: string, salt?: string) {
    const finalSalt = salt ?? generateSalt()
    const data = new TextEncoder().encode(`${finalSalt}:${password}`)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return new PasswordHash(toHex(digest), finalSalt)
  }

  static restore(hash: string, salt: string) {
    return new PasswordHash(hash, salt)
  }

  async verify(password: string) {
    const next = await PasswordHash.fromPassword(password, this._salt)
    return next.hash === this._hash
  }

  get hash() {
    return this._hash
  }

  get salt() {
    return this._salt
  }
}
