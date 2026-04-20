export interface AiCredentialSecretStore {
  put(data: {
    workspaceId: string
    userId: number
    provider: string
    credentialRef: string
    secret: string
  }): void
  getByCredentialRef(credentialRef: string): string | null
  deleteByCredentialRef(credentialRef: string): void
}
