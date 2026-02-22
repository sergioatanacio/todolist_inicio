import { DomainError } from '../errores/DomainError.ts'
import { DisponibilidadAggregate } from '../entidades/DisponibilidadAggregate.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const assertThrows = (fn: () => void, expectedCode: DomainError['code']) => {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (!(error instanceof DomainError)) {
      throw new Error('Expected DomainError')
    }
    assert(
      error.code === expectedCode,
      `Expected code ${expectedCode} but got ${error.code}`,
    )
  }
}

export const disponibilidadAggregateSpec = () => {
  const disponibilidad = DisponibilidadAggregate.create({
    projectId: 'prj-1',
    name: 'Disponibilidad semanal',
    description: 'Bloque base',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  })
  const withSegment = disponibilidad.addSegment({
    name: 'Manana laboral',
    description: 'Horario principal',
    startTime: '09:00',
    endTime: '11:00',
    daysOfWeek: [1, 2, 3, 4, 5],
  })
  assert(withSegment.calcularMinutosValidos() > 0, 'Expected valid minutes > 0')

  assertThrows(() => withSegment.removeSegment('missing'), 'NOT_FOUND')
}
