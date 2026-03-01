import { domainError } from '../errores/DomainError'
import { GreedySchedulingStrategy } from './scheduling/GreedySchedulingStrategy'
import type { SchedulingStrategy } from './scheduling/SchedulingStrategy'
import type {
  SchedulingInput,
  SchedulingOptions,
  SchedulingResult,
  ScheduledTaskBlock,
} from './scheduling/SchedulingTypes'

export type {
  ScheduledTaskBlock,
  SchedulingOptions,
  SchedulingResult,
  SchedulingInput,
}

export class SchedulingPolicy {
  constructor(
    private readonly strategy: SchedulingStrategy = new GreedySchedulingStrategy(),
  ) {}

  buildPlan(input: SchedulingInput): SchedulingResult {
    const { disponibilidad } = input
    if (disponibilidad.state !== 'ACTIVE') {
      throw domainError(
        'INVALID_STATE',
        'No se puede planificar con una disponibilidad archivada',
      )
    }
    return this.strategy.buildPlan(input)
  }
}
