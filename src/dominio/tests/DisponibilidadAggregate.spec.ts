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

  const archived = withSegment.archive()
  assert(archived.state === 'ARCHIVED', 'Expected availability state ARCHIVED')
  assertThrows(
    () =>
      archived.addSegment({
        name: 'No permitido',
        startTime: '10:00',
        endTime: '11:00',
        daysOfWeek: [1],
      }),
    'INVALID_TRANSITION',
  )
  const reactivated = archived.reactivate()
  assert(reactivated.state === 'ACTIVE', 'Expected availability state ACTIVE')

  const lifecycleEvents = reactivated
    .pullDomainEvents()
    .filter(
      (event) =>
        event.type === 'availability.archived' ||
        event.type === 'availability.reactivated',
    )
  assert(lifecycleEvents.length === 2, 'Expected lifecycle transition events')

  const withExclusion = DisponibilidadAggregate.create({
    projectId: 'prj-2',
    name: 'Con exclusion',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    segments: [
      {
        name: 'Laboral excluye lunes',
        startTime: '09:00',
        endTime: '10:00',
        daysOfWeek: [1],
        exclusionDates: ['2026-02-02'],
      },
    ],
  })
  assert(
    withExclusion.calcularMinutosValidos() === 180,
    'Expected 3 Mondays x 60 minutes because one Monday is excluded',
  )
}
