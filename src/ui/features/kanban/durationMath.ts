export type DurationEvaluation =
  | { ok: true; minutes: number }
  | { ok: false; error: string }

const isIntegerToken = (value: string) => /^[0-9]+$/.test(value)
const isOperatorToken = (value: string) => value === '+' || value === '-' || value === '*' || value === '/'

const clampLowerBound = (value: number, minValue: number) =>
  Math.max(minValue, Math.trunc(value))

export const evaluateMinutesExpression = (
  input: string,
  options?: { minValue?: number },
): DurationEvaluation => {
  const minValue = options?.minValue ?? 0
  const normalized = input.replace(/\s+/g, '')
  if (normalized.length < 1) {
    return { ok: false, error: 'La duracion en minutos es obligatoria' }
  }
  if (/[^0-9+\-*/]/.test(normalized)) {
    return { ok: false, error: 'Solo se permiten numeros y operadores + - * /' }
  }

  const tokens = normalized.match(/[0-9]+|[+\-*/]/g)
  if (!tokens || tokens.join('') !== normalized) {
    return { ok: false, error: 'Expresion de minutos invalida' }
  }
  if (tokens.length % 2 === 0) {
    return { ok: false, error: 'Expresion de minutos incompleta' }
  }
  if (!isIntegerToken(tokens[0])) {
    return { ok: false, error: 'La expresion debe iniciar con un numero' }
  }

  let result = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i]
    const right = tokens[i + 1]
    if (!isOperatorToken(operator) || !isIntegerToken(right)) {
      return { ok: false, error: 'Expresion de minutos invalida' }
    }

    const rightValue = Number(right)
    if (operator === '+') result += rightValue
    if (operator === '-') result -= rightValue
    if (operator === '*') result *= rightValue
    if (operator === '/') {
      if (rightValue === 0) {
        return { ok: false, error: 'No se puede dividir entre cero' }
      }
      result = Math.trunc(result / rightValue)
    }
  }

  return { ok: true, minutes: clampLowerBound(result, minValue) }
}

export const evaluateHoursInput = (
  input: string,
): { ok: true; hours: number } | { ok: false; error: string } => {
  const normalized = input.trim()
  if (!/^[0-9]+$/.test(normalized)) {
    return { ok: false, error: 'Las horas deben ser un entero no negativo' }
  }
  return { ok: true, hours: Number(normalized) }
}

export const normalizeDurationFromMinutes = (minutes: number) => {
  const safeTotalMinutes = clampLowerBound(minutes, 1)
  const hours = Math.trunc(safeTotalMinutes / 60)
  const minutesRemainder = safeTotalMinutes % 60
  return {
    totalMinutes: safeTotalMinutes,
    minutes: minutesRemainder,
    minutesText: String(minutesRemainder),
    hours,
    hoursText: String(hours),
  }
}
