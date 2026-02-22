import type { UnitOfWork } from '../dominio/puertos/UnitOfWork'

export class NoopUnitOfWork implements UnitOfWork {
  async runInTransaction<T>(work: () => T | Promise<T>) {
    return work()
  }
}
