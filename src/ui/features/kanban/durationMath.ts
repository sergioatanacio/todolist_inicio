export type DurationEvaluation =
  | { ok: true; minutes: number }
  | { ok: false; error: string }

const isIntegerToken = (value: string) => /^[0-9]+$/.test(value)
const isOperatorToken = (value: string) => value === '+' || value === '-' || value === '*' || value === '/'

const clampMinimumMinute = (value: number) => Math.max(1, Math.trunc(value))

export const evaluateMinutesExpression = (input: string): DurationEvaluation => {
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

  return { ok: true, minutes: clampMinimumMinute(result) }
}

export const evaluateHoursInput = (input: string): DurationEvaluation => {
  const normalized = input.trim()
  if (!/^[0-9]+$/.test(normalized)) {
    return { ok: false, error: 'Las horas deben ser un entero no negativo' }
  }
  const hours = Number(normalized)
  return { ok: true, minutes: clampMinimumMinute(hours * 60) }
}

export const normalizeDurationFromMinutes = (minutes: number) => {
  const safeMinutes = clampMinimumMinute(minutes)
  const hours = Math.trunc(safeMinutes / 60)
  return {
    minutes: safeMinutes,
    minutesText: String(safeMinutes),
    hours,
    hoursText: String(hours),
  }
}
