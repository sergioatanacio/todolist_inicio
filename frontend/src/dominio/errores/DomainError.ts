export type DomainErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DUPLICATE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_STATE'
  | 'INVALID_TRANSITION'
  | 'CONFLICT'

export class DomainError extends Error {
  readonly code: DomainErrorCode
  readonly details?: Record<string, unknown>

  constructor(
    code: DomainErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.details = details
  }
}

export const domainError = (
  code: DomainErrorCode,
  message: string,
  details?: Record<string, unknown>,
) => new DomainError(code, message, details)
