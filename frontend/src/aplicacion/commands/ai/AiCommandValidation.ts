import { domainError } from '../../../dominio/errores/DomainError'

const normalizeString = (value: string, field: string) => {
  const normalized = value.trim()
  if (normalized.length < 1) {
    throw domainError('VALIDATION_ERROR', `El campo ${field} es obligatorio`)
  }
  return normalized
}

const ensurePositiveInteger = (value: number, field: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw domainError(
      'VALIDATION_ERROR',
      `El campo ${field} debe ser un entero positivo`,
    )
  }
  return value
}

const ensureObject = (value: unknown, field: string) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw domainError('VALIDATION_ERROR', `El campo ${field} debe ser un objeto`)
  }
  return value as Record<string, unknown>
}

export const aiCommandValidation = {
  normalizeString,
  ensurePositiveInteger,
  ensureObject,
}
