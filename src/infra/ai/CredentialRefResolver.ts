import { domainError } from '../../dominio/errores/DomainError'
import type { AiCredentialSecretStore } from '../../dominio/puertos/AiCredentialSecretStore'

export class CredentialRefResolver {
  constructor(private readonly secretStore: AiCredentialSecretStore) {}

  resolveToken(credentialRef: string) {
    const token = this.secretStore.getByCredentialRef(credentialRef)
    if (!token) {
      throw domainError('FORBIDDEN', 'No hay token IA para la credencial indicada')
    }
    return token
  }
}
