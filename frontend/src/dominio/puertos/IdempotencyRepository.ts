export interface IdempotencyRepository {
  exists(key: string): boolean
  save(key: string, metadata?: Record<string, unknown>): void
}
