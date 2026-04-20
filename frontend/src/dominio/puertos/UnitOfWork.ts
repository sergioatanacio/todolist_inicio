export interface UnitOfWork {
  runInTransaction<T>(work: () => T | Promise<T>): Promise<T>
}

export interface TransactionStateReader {
  isInTransaction(): boolean
}
